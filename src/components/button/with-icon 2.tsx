import { Button } from '@/components/ui/button';
import { IconBell, IconCalendarCheck, IconTrash } from "@tabler/icons-react";

export default function ButtonDemo() {
  return (
    <div className="flex items-center gap-4">
      <Button variant="primary">
        <IconTrash size={20} stroke={2} /> Primary
      </Button>
      <Button variant="outline">
        <IconBell size={20} stroke={2} /> Outline
      </Button>
      <Button variant="ghost">
        <IconCalendarCheck size={20} stroke={2} /> Ghost
      </Button>
    </div>
  );
}
