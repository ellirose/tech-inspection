import type { Dictionary } from "@/i18n/dictionaries";
import { photos } from "@/lib/media";
import { Container, SectionHeading } from "@/components/ui/Section";
import { PhotoRibbon } from "@/components/media/PhotoRibbon";

const rows: [string[], string[]] = [
  ["/media/photos/uv-inspector.jpg", "/media/methods/pt-8.jpg", "/media/photos/team-office.jpg", "/media/methods/mt-15.jpg", "/media/photos/engineering-tools.jpg", "/media/photos/pdc-bit.jpg", "/media/methods/mt-11.jpg", "/media/photos/warehouse.jpg"],
  ["/media/methods/ut-5.jpg", "/media/methods/mt-12.jpg", "/media/photos/bit-inspection.jpg", "/media/methods/pt-13.jpg", "/media/photos/oil-field.jpg", "/media/photos/tool-measure.jpg", "/media/methods/mt-10.jpg", "/media/photos/pressure-wash.jpg"],
];

/** Two crossing ribbons of real field photos. */
export function FieldGallery({ dict, index }: { dict: Dictionary; index?: string }) {
  const g = dict.gallery;
  return (
    <section className="relative isolate overflow-hidden pb-24 pt-24 sm:pb-32 sm:pt-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-dots mask-radial" />
      <Container>
        <SectionHeading align="center" index={index} eyebrow={g.eyebrow} title={g.title} lead={g.lead} />
      </Container>
      <PhotoRibbon className="mt-6" rows={[photos(rows[0]), photos(rows[1])]} />
    </section>
  );
}
