import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { properties } from "@/db/schema";
import type { CreatePropertyDTO, UpdatePropertyDTO, Property } from "@/types/property";

export class PropertyService {
  /**
   * Create a new property
   */
  static async createProperty(data: CreatePropertyDTO): Promise<Property> {
    const [property] = await db
      .insert(properties)
      .values({
        organizationId: data.organizationId, // v2: required field
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        propertyType: data.propertyType,
        purchasePrice: data.purchasePrice.toString(),
        appraisedValue: data.appraisedValue?.toString() || null,
        appraisalDate: data.appraisalDate || null,
        // v2 fields (optional)
        occupancy: data.occupancy || null,
        estimatedValue: data.estimatedValue?.toString() || null,
        rehabBudget: data.rehabBudget?.toString() || null,
        photos: data.photos || null,
      })
      .returning();

    return property as Property;
  }

  /**
   * Get property by ID
   */
  static async getPropertyById(id: string): Promise<Property | null> {
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);

    return (property as Property) || null;
  }

  /**
   * Get all properties
   */
  static async getProperties(): Promise<Property[]> {
    const result = await db.select().from(properties);
    return result as Property[];
  }

  /**
   * Update a property
   */
  static async updateProperty(id: string, data: UpdatePropertyDTO): Promise<Property | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.zip !== undefined) updateData.zip = data.zip;
    if (data.propertyType !== undefined) updateData.propertyType = data.propertyType;
    if (data.purchasePrice !== undefined) updateData.purchasePrice = data.purchasePrice.toString();
    if (data.appraisedValue !== undefined) updateData.appraisedValue = data.appraisedValue?.toString() || null;
    if (data.appraisalDate !== undefined) updateData.appraisalDate = data.appraisalDate;

    const [property] = await db
      .update(properties)
      .set(updateData)
      .where(eq(properties.id, id))
      .returning();

    return (property as Property) || null;
  }

  /**
   * Delete a property
   */
  static async deleteProperty(id: string): Promise<boolean> {
    await db.delete(properties).where(eq(properties.id, id));
    return true;
  }

}

