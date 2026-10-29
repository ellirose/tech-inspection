import type { Dictionary } from "@/i18n/dictionaries";
import { photos } from "@/lib/media";
import { Container, SectionHeading } from "@/components/ui/Section";
import { PhotoRibbon } from "@/components/media/PhotoRibbon";

const rows: [string[], string[]] = [
  ["/media/photos/uv-inspector.jpg", "/media/methods/pt-8.jpg", "/media/photos/team-office.jpg", "/media/methods/mt-15.jpg", "/media/photos/engineering-tools.jpg", "/media/photos/pdc-bit.jpg", "/media/methods/mt-11.jpg", "/media/photos/warehouse.jpg"],
  ["/media/methods/ut-5.jpg", "/media/methods/mt-12.jpg", "/media/photos/bit-inspection.jpg", "/media/methods/pt-13.jpg", "/media/photos/oil-field.jpg", "/media/photos/tool-measure.jpg", "/media/methods/mt-10.jpg", "/media/photos/pressure-wash.jpg"],
];

/** Two drifting rows of real field photos between the video band and the platform. */
export function FieldGallery({ dict }: { dict: Dictionary }) {
  const g = dict.gallery;
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow={g.eyebrow} title={g.title} lead={g.lead} align="center" />
      </Container>
      <PhotoRibbon className="mt-12" rows={[photos(rows[0]), photos(rows[1])]} />
    </section>
  );
}
