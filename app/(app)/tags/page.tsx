import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageSection } from "@/components/layout/page-section";

export default function TagsPage() {
  return (
    <div className="space-y-6">
      <PageSection
        title="Tags & Categories"
        description="Tag CRUD contracts are ready for duplicate validation, rename propagation, and delete confirmation."
        actions={<Button data-testid="tag-create-trigger">Create tag</Button>}
      >
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_auto]">
          <Input data-testid="tag-name-input" placeholder="Tag name" />
          <Input data-testid="tag-color-input" placeholder="#0f766e" />
          <Button data-testid="tag-save">Save tag</Button>
        </div>
        <div className="mt-3 rounded-2xl border border-dashed border-border/80 p-4 text-sm text-muted-foreground" data-testid="tag-preview">
          Preview: Work
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border border-border/80">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/70 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Color</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {["Work", "Health", "Study"].map((item) => (
                <tr key={item} className="border-t border-border/70">
                  <td className="px-4 py-3 font-medium">{item}</td>
                  <td className="px-4 py-3">#0f766e</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" data-testid="tag-rename-trigger">
                        Rename
                      </Button>
                      <Button size="sm" variant="outline" data-testid="tag-delete-trigger">
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-muted-foreground" data-testid="tag-name-error">
          Duplicate-name validation placeholder.
        </p>
        <Input className="mt-3 max-w-sm" data-testid="tag-rename-input" placeholder="Rename selected tag" />
        <Button className="mt-3" data-testid="tag-rename-save" variant="outline">
          Confirm rename
        </Button>
        <div className="mt-3 rounded-2xl border border-dashed border-border/80 p-4 text-sm text-muted-foreground" data-testid="tag-delete-dialog">
          Delete confirmation placeholder.
          <Button className="ml-3" size="sm" data-testid="tag-delete-confirm">
            Confirm
          </Button>
        </div>
      </PageSection>
    </div>
  );
}
