# Code Patterns & Examples

This file contains copy-paste ready patterns used throughout the Lending OS codebase.

## Table of Contents
- [Database Schema Pattern](#database-schema-pattern)
- [Service Layer Pattern](#service-layer-pattern)
- [API Route Patterns](#api-route-patterns)
- [React Query Hooks](#react-query-hooks)
- [Form Patterns](#form-patterns)
- [Table Patterns](#table-patterns)
- [Type Definitions](#type-definitions)

---

## Database Schema Pattern

### Entity Table
```typescript
// src/db/schema/entities.ts
import { pgTable, text, timestamp, uuid, pgEnum, index } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const entityTypeEnum = pgEnum("entity_type", ["type1", "type2", "type3"]);

export const entities = pgTable("entities", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),

  // Fields
  name: text("name").notNull(),
  email: text("email").notNull(),
  entityType: entityTypeEnum("entity_type").notNull().default("type1"),

  // Metadata
  notes: text("notes"),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  organizationIdx: index("entities_organization_id_idx").on(table.organizationId),
  emailIdx: index("entities_email_idx").on(table.email),
}));

// Export from index
// src/db/schema/index.ts
export * from "./entities";
```

### Many-to-Many Relationship Table
```typescript
// src/db/schema/relationships.ts
import { pgTable, uuid, primaryKey } from "drizzle-orm/pg-core";
import { entities } from "./entities";
import { loans } from "./loans";

export const entityLoans = pgTable("entity_loans", {
  entityId: uuid("entity_id")
    .notNull()
    .references(() => entities.id, { onDelete: "cascade" }),
  loanId: uuid("loan_id")
    .notNull()
    .references(() => loans.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.entityId, table.loanId] }),
}));
```

---

## Service Layer Pattern

### Complete Service Class
```typescript
// src/services/entity.service.ts
import { eq, and } from "drizzle-orm";
import { db } from "@/db/client";
import { entities } from "@/db/schema";
import type { CreateEntityDTO, UpdateEntityDTO, Entity } from "@/types/entity";

export class EntityService {
  /**
   * Create a new entity
   */
  static async createEntity(data: CreateEntityDTO): Promise<Entity> {
    const [entity] = await db
      .insert(entities)
      .values({
        organizationId: data.organizationId,
        name: data.name,
        email: data.email,
        entityType: data.entityType,
        notes: data.notes || null,
      })
      .returning();

    return entity as Entity;
  }

  /**
   * Get entity by ID
   */
  static async getEntityById(id: string, organizationId?: string): Promise<Entity | null> {
    const conditions = organizationId
      ? and(eq(entities.id, id), eq(entities.organizationId, organizationId))
      : eq(entities.id, id);

    const [entity] = await db
      .select()
      .from(entities)
      .where(conditions)
      .limit(1);

    return (entity as Entity) || null;
  }

  /**
   * Get all entities for an organization
   */
  static async getEntitiesByOrganization(organizationId: string): Promise<Entity[]> {
    const result = await db
      .select()
      .from(entities)
      .where(eq(entities.organizationId, organizationId))
      .orderBy(entities.createdAt);

    return result as Entity[];
  }

  /**
   * Update an entity
   */
  static async updateEntity(id: string, data: UpdateEntityDTO): Promise<Entity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.entityType !== undefined) updateData.entityType = data.entityType;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const [entity] = await db
      .update(entities)
      .set(updateData)
      .where(eq(entities.id, id))
      .returning();

    return (entity as Entity) || null;
  }

  /**
   * Delete an entity
   */
  static async deleteEntity(id: string): Promise<boolean> {
    await db.delete(entities).where(eq(entities.id, id));
    return true;
  }
}
```

---

## API Route Patterns

### Collection Route (GET, POST)
```typescript
// src/app/api/v1/entities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { EntityService } from "@/services/entity.service";
import { requireAuth } from "@/lib/session";
import { createEntitySchema } from "@/types/entity";

/**
 * GET /api/v1/entities
 * Get all entities for the authenticated user's organization
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const entities = await EntityService.getEntitiesByOrganization(session.userId);

    return NextResponse.json({
      success: true,
      data: entities,
      count: entities.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error fetching entities:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/v1/entities
 * Create a new entity
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    // Validate with Zod
    const validationResult = createEntitySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const entityData = {
      ...validationResult.data,
      organizationId: session.userId,
    };

    const entity = await EntityService.createEntity(entityData);

    return NextResponse.json(
      {
        success: true,
        data: entity,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error creating entity:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
```

### Resource Route (GET, PATCH, DELETE)
```typescript
// src/app/api/v1/entities/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { EntityService } from "@/services/entity.service";
import { requireAuth } from "@/lib/session";
import { updateEntitySchema } from "@/types/entity";

/**
 * GET /api/v1/entities/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const entity = await EntityService.getEntityById(params.id, session.userId);

    if (!entity) {
      return NextResponse.json({ success: false, error: "Entity not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: entity });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error fetching entity:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/v1/entities/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    // Validate with Zod
    const validationResult = updateEntitySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await EntityService.getEntityById(params.id, session.userId);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Entity not found" }, { status: 404 });
    }

    const entity = await EntityService.updateEntity(params.id, validationResult.data);

    return NextResponse.json({ success: true, data: entity });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error updating entity:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/v1/entities/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();

    // Verify ownership
    const existing = await EntityService.getEntityById(params.id, session.userId);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Entity not found" }, { status: 404 });
    }

    await EntityService.deleteEntity(params.id);

    return NextResponse.json({ success: true, message: "Entity deleted" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error deleting entity:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
```

---

## React Query Hooks

### Basic Query Hook
```typescript
// src/hooks/useEntities.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Entity, CreateEntityDTO, UpdateEntityDTO } from "@/types/entity";

export const useEntities = () => {
  return useQuery({
    queryKey: ["entities"],
    queryFn: async () => {
      const response = await fetch("/api/v1/entities");
      if (!response.ok) throw new Error("Failed to fetch entities");
      const data = await response.json();
      return data.data as Entity[];
    },
  });
};

export const useEntity = (id: string) => {
  return useQuery({
    queryKey: ["entities", id],
    queryFn: async () => {
      const response = await fetch(`/api/v1/entities/${id}`);
      if (!response.ok) throw new Error("Failed to fetch entity");
      const data = await response.json();
      return data.data as Entity;
    },
    enabled: !!id,
  });
};

export const useCreateEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEntityDTO) => {
      const response = await fetch("/api/v1/entities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create entity");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities"] });
    },
  });
};

export const useUpdateEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateEntityDTO }) => {
      const response = await fetch(`/api/v1/entities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update entity");
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["entities"] });
      queryClient.invalidateQueries({ queryKey: ["entities", variables.id] });
    },
  });
};

export const useDeleteEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/entities/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete entity");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities"] });
    },
  });
};
```

---

## Form Patterns

### Form Component with Zod Validation
```typescript
// src/components/entities/EntityForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateEntity, useUpdateEntity } from "@/hooks/useEntities";
import type { Entity } from "@/types/entity";

const entityFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  entityType: z.enum(["type1", "type2", "type3"]),
  notes: z.string().optional(),
});

type EntityFormValues = z.infer<typeof entityFormSchema>;

interface EntityFormProps {
  entity?: Entity;
  onSuccess?: () => void;
}

export function EntityForm({ entity, onSuccess }: EntityFormProps) {
  const createEntity = useCreateEntity();
  const updateEntity = useUpdateEntity();

  const form = useForm<EntityFormValues>({
    resolver: zodResolver(entityFormSchema),
    defaultValues: {
      name: entity?.name || "",
      email: entity?.email || "",
      entityType: entity?.entityType || "type1",
      notes: entity?.notes || "",
    },
  });

  const onSubmit = async (data: EntityFormValues) => {
    try {
      if (entity) {
        await updateEntity.mutateAsync({ id: entity.id, data });
        toast.success("Entity updated successfully");
      } else {
        await createEntity.mutateAsync(data);
        toast.success("Entity created successfully");
      }
      onSuccess?.();
    } catch (error) {
      toast.error(entity ? "Failed to update entity" : "Failed to create entity");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="entityType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="type1">Type 1</SelectItem>
                  <SelectItem value="type2">Type 2</SelectItem>
                  <SelectItem value="type3">Type 3</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Optional notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={createEntity.isPending || updateEntity.isPending}>
          {entity ? "Update" : "Create"} Entity
        </Button>
      </form>
    </Form>
  );
}
```

---

## Table Patterns

### TanStack Table with Actions
```typescript
// src/app/(main)/dashboard/entities/page.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { SimpleDataTable } from "@/components/data-table/simple-data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useEntities, useDeleteEntity } from "@/hooks/useEntities";
import type { Entity } from "@/types/entity";
import { toast } from "sonner";

export default function EntitiesPage() {
  const { data: entities, isLoading } = useEntities();
  const deleteEntity = useDeleteEntity();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entity?")) return;

    try {
      await deleteEntity.mutateAsync(id);
      toast.success("Entity deleted successfully");
    } catch (error) {
      toast.error("Failed to delete entity");
    }
  };

  const columns: ColumnDef<Entity>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "entityType",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.entityType}</Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const entity = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => console.log("Edit", entity.id)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(entity.id)}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Entities</h1>
        <Button>Add Entity</Button>
      </div>

      <SimpleDataTable columns={columns} data={entities || []} />
    </div>
  );
}
```

---

## Type Definitions

### Complete Type File
```typescript
// src/types/entity.ts
import { z } from "zod";

// Database entity type
export interface Entity {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  entityType: "type1" | "type2" | "type3";
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Zod schemas for validation
export const createEntitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  entityType: z.enum(["type1", "type2", "type3"]),
  notes: z.string().optional(),
});

export const updateEntitySchema = createEntitySchema.partial();

// DTO types derived from Zod schemas
export type CreateEntityDTO = z.infer<typeof createEntitySchema> & {
  organizationId: string;
};

export type UpdateEntityDTO = z.infer<typeof updateEntitySchema>;
```

---

## Summary

These patterns are used consistently throughout the codebase:
- **Database schemas** follow Drizzle conventions with indexes
- **Services** encapsulate all business logic
- **API routes** use consistent error handling and auth
- **React Query hooks** handle data fetching and mutations
- **Forms** use React Hook Form + Zod
- **Tables** use TanStack Table with action menus
- **Types** use Zod schemas as single source of truth
