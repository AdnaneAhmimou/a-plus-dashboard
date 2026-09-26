// Seeds a SAMPLE ancestry profile onto one patient's box so the Ancestry
// section can be reviewed before a real ancestry PDF parser exists. The
// numbers are the ones shown in the reference platform's screenshots that
// were used as the design spec; they are illustrative, not this patient's
// real data. Run with: npx tsx scripts/seed-ancestry-sample.ts [email]
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] ?? "newclient@example.com";
  const user = await prisma.user.findUnique({ where: { email }, include: { box: true } });
  if (!user?.box) throw new Error(`No box found for ${email}`);

  const profile = await prisma.ancestryProfile.upsert({
    where: { boxId: user.box.id },
    create: { boxId: user.box.id, ...SAMPLE },
    update: SAMPLE,
  });
  console.log(`Ancestry profile ${profile.id} seeded on box ${user.box.number} (${email})`);
}

const SAMPLE = {
  composition: [
    { region: "Europe", percent: 81.4 },
    { region: "America", percent: 9.7 },
    { region: "Africa", percent: 6 },
    { region: "Western Asia", percent: 2.9 },
  ],
  maternalHaplogroup: "H",
  maternalSubhaplogroup: "H1",
  maternalMigration: [
    {
      era: "More than 150,000 years ago",
      haplogroup: "L",
      description:
        "The oldest maternal lineage, from which all present-day mitochondrial haplogroups descend. It arose in Africa.",
    },
    {
      era: "Around 70,000 years ago",
      haplogroup: "L3",
      description:
        "The branch of L that left Africa. Nearly all non-African maternal lineages descend from L3.",
    },
    {
      era: "Around 60,000 years ago",
      haplogroup: "N",
      description:
        "One of the two founding lineages outside Africa, associated with the early expansion across Western Asia.",
    },
    {
      era: "Around 55,000 years ago",
      haplogroup: "R",
      description:
        "A widespread daughter branch of N found across Eurasia, the ancestor of many European and Asian lineages.",
    },
    {
      era: "Around 40,000 years ago",
      haplogroup: "R0",
      description: "The branch of R that gave rise to HV, and through it to haplogroup H.",
    },
    {
      era: "Around 30,000 years ago",
      haplogroup: "HV",
      description:
        "Concentrated in Western Asia and the Near East before its descendants spread into Europe.",
    },
    {
      era: "Around 25,000 years ago",
      haplogroup: "H",
      description:
        "The most common maternal haplogroup in Europe today, carried by roughly 40% of Europeans. It expanded across the continent after the Last Glacial Maximum, from refuges in south-western Europe. H1 is its largest branch, most frequent in the Iberian Peninsula, North Africa and Western Europe.",
    },
  ],
  paternalHaplogroup: null,
  paternalSubhaplogroup: null,
  paternalMigration: undefined,
  neanderthalPercent: 1.5,
  neanderthalVariants: 418,
  neanderthalVsAverage: 5.29,
  neanderthalSections: [
    {
      title: "Origin and extinction",
      text: "Neanderthals emerged as a species approximately 230,000 years ago in Europe, the Near East, the Middle East, and Central Asia. It is estimated that the Neanderthal population was constant, not exceeding 7,000 individuals across the continent, reaching its peak 100,000 years ago.\n\nOn the other hand, their extinction dates back to 28,000 years ago, and the causes are not fully known. Most studies suggest that the expansion of our species, Homo sapiens, from Africa would have been the main cause of the decline and disappearance of theirs, despite the interbreeding that occurred between the two.",
    },
    {
      title: "Physical features",
      text: "Neanderthals had a stocky build, weighing around 70 kg and short stature, not exceeding 1.65 meters, with a body adapted to low temperatures. They had short limbs, a wide pelvis, and skeletal robustness that indicates a body with a high musculature, superior to that of Homo sapiens.\n\nFacially, Neanderthals had an elongated skull, a low, sloping forehead, and no chin, with prominent teeth. Recent studies suggest that the shape of their larynx would have allowed them to speak articulately.",
    },
    {
      title: "Lifestyle",
      text: "Neanderthals were structured in small clans of between 5 and 15 individuals, with a nomadic lifestyle, which resulted in a life expectancy that did not exceed 30 years for women, and 40 years for men.\n\nNeanderthal settlements were found mainly in the mountains in warmer environments, and in caves in colder ones. These showed a complex structure with a center for the central hearth, which was mainly used for cooking food. Remains show that they used stone and flint tools, which they carved for their main activities.\n\nOn the social aspect, due to the remains of burial rituals and care tools, it is considered that Neanderthals established strong emotional bonds between individuals of the same clan.",
    },
    {
      title: "Feeding",
      text: "Although for a long time it was considered that the Neanderthal diet was based on meat, more recent studies show that their diet was very diverse and adapted to their environment. Their diet was centered mainly on hunting (large and small mammals, birds, fish, and reptiles), and on gathering fruits and vegetables.\n\nNeanderthals were also knowledgeable about fire, using it to cook their food, as well as to make rudimentary pharmaceuticals.",
    },
    {
      title: "Culture",
      text: "There is debate about the Neanderthals' ability to generate art. One side claims that some objects found with marks and notches had a decorative and artistic function. Others argue that these marks derive from the use of the objects in question, and not from an artistic intent on the part of the Neanderthal. In this way they deny Neanderthal artistic ability, attributing it only to Homo sapiens.\n\nThe best-known case of possible Neanderthal art is the Berajat Ram Venus. A figure carved in the volcanic rock of small length (3.5 cm), dating from 250,000 years ago in the Golan Heights (between Israel, Lebanon, Jordan, and Syria). Trazalogical studies prove that this figure was elaborated by a series of incisions with a sharpened tool in a voluntary way. However, other recent studies affirm that this target originated by natural erosion and that there was no artistic intentionality in its manipulation, although it is still an open debate.",
    },
  ],
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
