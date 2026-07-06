// import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs'


// const prisma = new PrismaClient()
import {prisma} from '@/lib/prisma'

async function main() {
  console.log('🌿 Seeding HerbRx database…')

  const passwordHash      = await bcrypt.hash('U2Akpos@herbrx26',    12)
  const customerHash      = await bcrypt.hash('customer123', 12)
  const producerHash      = await bcrypt.hash('producer123', 12)

  // ── Users ──────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where:  { email: 'admin@herbrx.ng' },
    update: {},
    create: { email: 'admin@herbrx.ng', firstName: 'Ajiri', lastName: 'Omas', phone: '08012345678', passwordHash, emailVerified: true, role: 'ADMIN' },
  })
  console.log('  ✓ Admin:', admin.email)

  const customer = await prisma.user.upsert({
    where:  { email: 'customer@herbrx.ng' },
    update: {},
    create: { email: 'customer@herbrx.ng', firstName: 'Okezi', lastName: 'Omas', phone: '08087654321', passwordHash: customerHash, emailVerified: true, role: 'CUSTOMER' },
  })
  console.log('  ✓ Customer:', customer.email)

  const producer = await prisma.user.upsert({
    where:  { email: 'producer@herbrx.ng' },
    update: {},
    create: { email: 'producer@herbrx.ng', firstName: 'Akpofure', lastName: 'Ajiri', phone: '08055551234', passwordHash: producerHash, emailVerified: true, role: 'PRODUCER' },
  })
  console.log('  ✓ Producer:', producer.email)

  // ── Producer Profile ──────────
  const producerProfile = await prisma.producerProfile.upsert({
    where:  { userId: producer.id },
    update: {},
    create: {
      userId:        producer.id,
      businessName:  'GreenHealth Nigeria Ltd',
      businessEmail: 'hello@greenhealth.ng',
      businessPhone: '08055551234',
      rcNumber:      'RC-1234567',
      nafdacNumber:  'A7-1234',
      tier:          'VERIFIED',
      verifiedAt:    new Date('2025-01-15'),
      verifiedBy:    admin.id,
    },
  })
  console.log('  ✓ Producer profile:', producerProfile.businessName)

  // ── Producer Products ────────────────────────────────────────────────
  const products = [
    { name: 'Moringa Gold Capsules 500mg', category: 'Capsules',  status: 'APPROVED' as const, emoji: '🌿', price: 6200, desc: 'Cold-pressed Moringa oleifera from certified Kwara State farms.', ing: ['Moringa Oleifera Leaf Powder (500mg)', 'Vegetable Cellulose (capsule)'], warn: ['May interact with thyroid medication', 'High Vitamin K — consult doctor if on warfarin'], nafdac: 'A7-1234', inStore: true,  stock: 120, sales: 198, revenue: 1227600 },
    { name: 'Bitter Leaf Tonic 250ml',     category: 'Tonic',     status: 'PENDING_REVIEW' as const, emoji: '🍃', price: 3800, desc: 'Cold-extracted Vernonia amygdalina for blood sugar support.', ing: ['Bitter Leaf Extract (250mg)', 'Distilled Water', 'Glycerin'], warn: ['Consult doctor if diabetic', 'Not for use during pregnancy'], nafdac: undefined, inStore: false, stock: 60,  sales: 0,   revenue: 0       },
    { name: 'Shea Butter Balm 200g',       category: 'Topical',   status: 'APPROVED' as const, emoji: '🧴', price: 2500, desc: 'Raw unrefined shea butter from Northern Nigeria.', ing: ['Unrefined Shea Butter', 'Coconut Oil', 'Lavender Essential Oil'], warn: ['For external use only', 'Patch test before use'], nafdac: undefined, inStore: true,  stock: 80,  sales: 87,  revenue: 217500  },
  ]

  for (const p of products) {
    const existing = await prisma.producerProduct.findFirst({
      where: { producerProfileId: producerProfile.id, name: p.name },
    })
    if (!existing) {
      const prod = await prisma.producerProduct.create({
        data: {
          producerProfileId: producerProfile.id,
          name:              p.name,
          description:       p.desc,
          category:          p.category,
          status:            p.status,
        },
      })
      await prisma.productMeta.create({
        data: {
          productId:   prod.id,
          price:       p.price,
          emoji:       p.emoji,
          productType: p.category,
          ingredients: p.ing,
          warnings:    p.warn,
          nafdacNo:    p.nafdac,
          inStore:     p.inStore,
          stock:       p.stock,
          sales:       p.sales,
          revenue:     p.revenue,
        },
      })
      console.log(`  ✓ Product: ${p.name}`)
    }
  }

  // ── Safety Alerts ──────────────────────────────────────────────────────
  const alerts = [
    { title: 'Counterfeit Moringa Capsules Detected in Lagos Markets', body: 'Multiple batches of counterfeit "SuperGreen Moringa 500mg" identified in Lagos Island and Alaba markets. Lab analysis reveals lead levels of 12.4 mg/kg — over 6× the safe limit of 2 mg/kg. Do not consume. Dispose of immediately.', severity: 'DANGER' as const, status: 'ACTIVE' as const, productName: 'SuperGreen Moringa 500mg', batchNo: 'B2024-FAKE-01' },
    { title: "St. John's Wort + SSRI Antidepressants — Serotonin Syndrome Risk", body: 'Significant risk of serotonin syndrome when combining St. John\'s Wort (Hypericum perforatum) with SSRI antidepressants including sertraline, fluoxetine, and citalopram. Patients taking SSRIs must discontinue St. John\'s Wort immediately and consult their physician.', severity: 'WARNING' as const, status: 'ACTIVE' as const, productName: "St. John's Wort Extract", batchNo: undefined },
    { title: 'High-Dose Bitter Leaf — Hypoglycaemia Risk in Diabetic Patients', body: 'High-dose Bitter Leaf preparations exceeding 500mg/day may cause additive blood glucose-lowering effects when combined with metformin, glibenclamide, or insulin. Diabetic patients should monitor blood glucose closely.', severity: 'WARNING' as const, status: 'ACTIVE' as const, productName: undefined, batchNo: undefined },
    { title: 'Shea Butter Adulteration — Kano Batch B2024-11 Recalled', body: 'Batch B2024-11 of "PureShea Body Butter" failed microbial count screening. All units recalled. Producer suspended pending compliance review.', severity: 'DANGER' as const, status: 'RESOLVED' as const, productName: 'PureShea Body Butter', batchNo: 'B2024-11' },
    { title: 'Updated Safety Guidelines: Bitter Leaf (Vernonia amygdalina)', body: 'HerbRx has published updated safety guidelines for all Bitter Leaf preparations incorporating new pharmacological research. Revised guides now available in the Herb Directory.', severity: 'INFO' as const, status: 'RESOLVED' as const, productName: undefined, batchNo: undefined },
  ]

  for (const a of alerts) {
    const exists = await prisma.safetyAlert.findFirst({ where: { title: a.title } })
    if (!exists) {
      await prisma.safetyAlert.create({
        data: { ...a, createdBy: admin.id },
      })
      console.log(`  ✓ Alert: ${a.title.slice(0, 50)}…`)
    }
  }

  // ── Herb Directory ─────────────────────────────────────────────────────
  const herbs = [
    {
      slug: 'moringa-oleifera', name: 'Moringa', scientificName: 'Moringa oleifera', emoji: '🌿',
      localNames: ['Zogale (Hausa)', 'Ewe Ile (Yoruba)', 'Odudu Oyibo (Igbo)'],
      category: 'Immune', safetyRating: 'CAUTION' as const,
      summary: 'Nutritionally dense tree leaf widely used in Northern Nigeria for general wellness and nutritional support. Good evidence for nutritional value; limited evidence for therapeutic claims.',
      keyBenefits: ['Rich source of iron, calcium, and vitamins A & C', 'Supports nutritional status', 'Antioxidant activity well-documented'],
      warnings: ['May mildly lower blood glucose — caution in diabetics', 'High Vitamin K — avoid with warfarin', 'Root and bark preparations are UNSAFE — only use leaf'],
      interactions: ['Warfarin (High Risk)', 'Metformin (Moderate)', 'Levothyroxine (Moderate)'],
      languages: ['English', 'Hausa', 'Igbo', 'Pidgin'],
    },
    {
      slug: 'vernonia-amygdalina', name: 'Bitter Leaf', scientificName: 'Vernonia amygdalina', emoji: '🍃',
      localNames: ['Ewuro (Yoruba)', 'Onugbu (Igbo)', 'Shiwaka (Hausa)'],
      category: 'Metabolic', safetyRating: 'CAUTION' as const,
      summary: 'One of the most widely used medicinal plants in Nigeria, primarily for blood sugar management and digestive support. Significant drug interactions with antidiabetics require careful monitoring.',
      keyBenefits: ['Clinically studied for hypoglycaemic effects', 'Anti-inflammatory and antioxidant properties', 'Traditional use for malaria management'],
      warnings: ['Additive hypoglycaemia risk with metformin and glibenclamide', 'Avoid in first trimester of pregnancy', 'High doses may cause nausea'],
      interactions: ['Metformin (High Risk)', 'Glibenclamide (High Risk)', 'Insulin (Moderate)', 'Antihypertensives (Moderate)'],
      languages: ['English', 'Yoruba', 'Igbo', 'Hausa', 'Pidgin'],
    },
    {
      slug: 'hibiscus-sabdariffa', name: 'Zobo / Hibiscus', scientificName: 'Hibiscus sabdariffa', emoji: '🫐',
      localNames: ['Zobo (Hausa/nationwide)', 'Isapa (Yoruba)', 'Oha Bekee (Igbo)'],
      category: 'Cardiovascular', safetyRating: 'CAUTION' as const,
      summary: 'The calyx of Hibiscus sabdariffa is widely consumed as Zobo drink in Nigeria. Good evidence for antihypertensive effects; significant medication interactions.',
      keyBenefits: ['Clinically significant reduction in systolic blood pressure', 'Rich in anthocyanins with antioxidant activity', 'Evidence for lipid-lowering effects'],
      warnings: ['May dangerously lower blood pressure when combined with antihypertensives', 'Avoid in pregnancy', 'Not suitable for people with low blood pressure'],
      interactions: ['Amlodipine (Moderate)', 'Hydrochlorothiazide (High Risk)', 'Lisinopril (Moderate)', 'Chloroquine (reduces absorption)'],
      languages: ['English', 'Hausa', 'Yoruba'],
    },
    {
      slug: 'azadirachta-indica', name: 'Neem', scientificName: 'Azadirachta indica', emoji: '🌳',
      localNames: ['Dogonyaro (Hausa)', 'Eedu (Yoruba)', 'Ogwu Akom (Igbo)'],
      category: 'Antimicrobial', safetyRating: 'DANGER' as const,
      summary: 'Neem has a long history of traditional use but carries serious safety risks, particularly for children and pregnant women. Internal neem oil is associated with deaths in children.',
      keyBenefits: ['Topical antimicrobial properties well-established', 'Effective against fungal skin infections', 'Pesticide applications well-studied'],
      warnings: ['NEVER give neem oil internally to children — fatalities documented', 'AVOID in pregnancy — may cause miscarriage', 'Internal use must be supervised by a professional'],
      interactions: ['Immunosuppressants (may reduce efficacy)', 'Lithium (increases levels)'],
      languages: ['English', 'Hausa', 'Yoruba', 'Igbo'],
    },
    {
      slug: 'ocimum-gratissimum', name: 'African Basil (Scent Leaf)', scientificName: 'Ocimum gratissimum', emoji: '🌱',
      localNames: ['Efirin (Yoruba)', 'Nchuanwu (Igbo)', 'Daidoya (Hausa)'],
      category: 'Antimicrobial', safetyRating: 'SAFE' as const,
      summary: 'Scent Leaf is one of Nigeria\'s most widely used culinary and medicinal herbs. When used in culinary quantities, it is generally safe. Concentrated extracts require caution.',
      keyBenefits: ['Strong antimicrobial activity against common pathogens', 'Anti-inflammatory effects documented in vitro', 'Traditional use for fever and respiratory conditions'],
      warnings: ['High-dose concentrated extracts may lower blood sugar', 'May have mild uterine-stimulating effects at very high doses'],
      interactions: ['Anticoagulants (mild, low risk at culinary doses)'],
      languages: ['English', 'Yoruba', 'Igbo', 'Pidgin'],
    },
    {
      slug: 'vitellaria-paradoxa', name: 'Shea Butter', scientificName: 'Vitellaria paradoxa', emoji: '🧴',
      localNames: ['Ori (Yoruba)', 'Okwuma (Igbo)', 'Kadanya (Hausa)'],
      category: 'Topical', safetyRating: 'SAFE' as const,
      summary: 'Raw unrefined Shea butter has an excellent safety profile for topical use. Adulterated commercial products may contain harmful additives.',
      keyBenefits: ['Excellent emollient with high fatty acid content', 'Anti-inflammatory triterpenes support wound healing', 'UV filtering properties offer mild sun protection'],
      warnings: ['Nut allergy sufferers should patch-test first', 'Buy from verified sources to avoid adulterated products'],
      interactions: ['No clinically significant drug interactions at topical doses'],
      languages: ['English', 'Yoruba', 'Hausa'],
    },
    {
      slug: 'zingiber-officinale', name: 'Ginger', scientificName: 'Zingiber officinale', emoji: '🫚',
      localNames: ['Jinja (Hausa)', 'Atale (Yoruba)', 'Ji Ose (Igbo)'],
      category: 'Digestive', safetyRating: 'CAUTION' as const,
      summary: 'Ginger is widely used across Nigeria as a culinary spice and medicinal herb. Generally safe at culinary doses; concentrated supplements carry anticoagulant risks.',
      keyBenefits: ['Strong evidence for reducing nausea and vomiting', 'Anti-inflammatory effects comparable to ibuprofen at high doses', 'Traditional use for colds and respiratory conditions'],
      warnings: ['May enhance anticoagulant effects of warfarin and aspirin', 'High doses may cause heartburn', 'Avoid concentrated supplements in first trimester'],
      interactions: ['Warfarin (Moderate)', 'Aspirin / NSAIDs (Moderate)', 'Antidiabetics (Low risk)'],
      languages: ['English', 'Hausa', 'Yoruba', 'Igbo', 'Pidgin'],
    },
    {
      slug: 'aloe-vera', name: 'Aloe Vera', scientificName: 'Aloe barbadensis miller', emoji: '🪴',
      localNames: ['Eti Erin (Yoruba)', 'Ahun (Igbo)'],
      category: 'Topical', safetyRating: 'CAUTION' as const,
      summary: 'Aloe vera gel has strong evidence for topical wound healing. Aloe latex (the yellow sap) is a potent laxative with serious internal use risks.',
      keyBenefits: ['Excellent evidence for wound healing (topical gel)', 'Mild evidence for blood glucose reduction', 'Anti-inflammatory effects well-documented'],
      warnings: ['Aloe latex is a STRONG laxative — avoid internal use', 'Prolonged internal use may cause electrolyte imbalances', 'Avoid topical use on deep wounds'],
      interactions: ['Digoxin (aloe latex increases toxicity risk)', 'Antidiabetics (may have additive effect)', 'Diuretics (increases hypokalaemia risk)'],
      languages: ['English', 'Yoruba', 'Pidgin'],
    },
  ]

  for (const h of herbs) {
    await prisma.herb.upsert({
      where:  { slug: h.slug },
      update: { ...h, reviewedAt: new Date(), publishedAt: new Date() },
      create: { ...h, reviewedAt: new Date(), publishedAt: new Date(), isPublished: true },
    })
    console.log(`  ✓ Herb: ${h.name}`)
  }

  // ── Product Safety Reviews ─────────────────────────────────────────────
  const safetyReviews = [
    {
      productName: 'Moringa Gold Capsules 500mg', producer: 'GreenHealth Nigeria', category: 'Capsules', emoji: '🌿',
      verdict: 'APPROVED' as const, overallScore: 9.1, batchNo: 'B2024-07', labName: 'Spectralab NG (NAFDAC Accredited)',
      nafdacNo: 'A7-1234', verifiedBadge: true,
      parameters: [
        { name: 'Lead (Pb)', result: '0.8 mg/kg', limit: '< 2 mg/kg', pass: true },
        { name: 'Mercury (Hg)', result: '0.02 mg/kg', limit: '< 0.1 mg/kg', pass: true },
        { name: 'Arsenic (As)', result: '0.15 mg/kg', limit: '< 1 mg/kg', pass: true },
        { name: 'Total Plate Count', result: '2.1×10² CFU/g', limit: '< 1×10⁴', pass: true },
        { name: 'E. coli', result: 'Not detected', limit: 'Absent', pass: true },
        { name: 'Salmonella', result: 'Not detected', limit: 'Absent', pass: true },
        { name: 'Moisture Content', result: '4.2%', limit: '< 8%', pass: true },
        { name: 'Active Marker ID', result: 'Confirmed: Glucosinolates', limit: 'Present', pass: true },
      ],
      summary: 'Moringa Gold Capsules achieved the highest safety rating in this category. All heavy metals, microbial, and active compound parameters passed with significant margin.',
      recommendation: 'Safe to use as directed on label. Standard drug interaction caveats apply — see Moringa profile in Herb Directory.',
    },
    {
      productName: 'Zobo Immune Blend Powder', producer: 'ZoboFresh Ltd', category: 'Powder', emoji: '🫐',
      verdict: 'REJECTED' as const, overallScore: 3.4, batchNo: 'B2024-11', labName: 'NaijaLab',
      verifiedBadge: false,
      parameters: [
        { name: 'Lead (Pb)', result: '0.5 mg/kg', limit: '< 2 mg/kg', pass: true },
        { name: 'Mercury (Hg)', result: '0.03 mg/kg', limit: '< 0.1 mg/kg', pass: true },
        { name: 'Total Plate Count', result: '8.2×10⁴ CFU/g', limit: '< 1×10⁴', pass: false },
        { name: 'Yeast & Mould', result: '6.8×10³ CFU/g', limit: '< 1×10²', pass: false },
        { name: 'E. coli', result: 'Not detected', limit: 'Absent', pass: true },
        { name: 'Moisture Content', result: '9.4%', limit: '< 8%', pass: false },
        { name: 'Active Marker ID', result: 'Confirmed: Anthocyanins', limit: 'Present', pass: true },
      ],
      summary: 'Batch B2024-11 failed on microbial count and moisture content. Total plate count was 8× over acceptable limit. The product poses a real infection risk to immunocompromised consumers.',
      recommendation: 'Do not purchase or consume Batch B2024-11. Resubmit after remediation with a new COA.',
    },
    {
      productName: 'Bitter Leaf Tonic 250ml', producer: 'HerbalNaija', category: 'Tonic', emoji: '🍃',
      verdict: 'CAUTION' as const, overallScore: 6.8, batchNo: 'B2024-10', labName: 'PharmAnalytics Ltd',
      verifiedBadge: false,
      parameters: [
        { name: 'Lead (Pb)', result: '1.4 mg/kg', limit: '< 2 mg/kg', pass: true },
        { name: 'Mercury (Hg)', result: '0.05 mg/kg', limit: '< 0.1 mg/kg', pass: true },
        { name: 'Total Plate Count', result: '4.8×10³ CFU/g', limit: '< 1×10⁴', pass: true },
        { name: 'Yeast & Mould', result: '1.2×10² CFU/g', limit: '< 1×10²', pass: false },
        { name: 'Active Marker ID', result: 'Confirmed: Sesquiterpene lactones', limit: 'Present', pass: true },
        { name: 'Label Accuracy', result: 'Dose claim unsubstantiated', limit: 'Accurate', pass: false },
      ],
      summary: 'Product passed most safety parameters. However, yeast and mould count marginally exceeds limits, and the label\'s therapeutic dose claim could not be confirmed.',
      recommendation: 'Use with caution. Diabetic patients should be aware that the actual effect may differ from advertised.',
    },
    {
      productName: 'PureShea Unrefined Body Butter 200g', producer: 'NaturaBlend Ltd', category: 'Topical', emoji: '🧴',
      verdict: 'APPROVED' as const, overallScore: 8.7, batchNo: 'B2024-06', labName: 'Spectralab NG',
      nafdacNo: 'A9-5678', verifiedBadge: true,
      parameters: [
        { name: 'Lead (Pb)', result: '0.1 mg/kg', limit: '< 5 mg/kg', pass: true },
        { name: 'Mercury (Hg)', result: 'Not detected', limit: '< 0.1 mg/kg', pass: true },
        { name: 'Microbial Count', result: '< 1×10¹ CFU/g', limit: '< 1×10²', pass: true },
        { name: 'Additive Screening', result: 'None detected', limit: 'No adulterants', pass: true },
        { name: 'Fatty Acid Profile', result: 'Confirmed: Stearic, Oleic acids', limit: 'Present', pass: true },
        { name: 'Label Accuracy', result: 'Accurate', limit: 'Accurate', pass: true },
      ],
      summary: 'PureShea Unrefined Body Butter is a genuinely high-quality product. Heavy metals negligible, no adulterants detected, fatty acid profiling confirmed authenticity.',
      recommendation: 'Safe for topical use as directed. Nut allergy sufferers should patch-test before full use.',
    },
  ]

  for (const r of safetyReviews) {
    const exists = await prisma.productSafetyReview.findFirst({ where: { productName: r.productName, batchNo: r.batchNo } })
    if (!exists) {
      await prisma.productSafetyReview.create({ data: { ...r, isPublished: true } })
      console.log(`  ✓ Safety Review: ${r.productName}`)
    }
  }

  // ── Safety Guides ──────────────────────────────────────────────────────
  const guides = [
    { slug: 'herb-drug-interactions-nigeria', title: 'The Complete Guide to Herb-Drug Interactions in Nigeria', description: 'A comprehensive reference covering the most common drug-herb interactions in Nigerian clinical practice, including warfarin, metformin, SSRIs, and antihypertensives.', category: 'Drug Interactions', languages: ['English', 'Igbo', 'Yoruba'], readTime: '18 min', downloadable: true, featured: true, emoji: '💊' },
    { slug: 'moringa-safety-guide', title: 'Moringa (Moringa oleifera) — Safe Use Guide', description: 'Everything you need to know about using Moringa safely: proven benefits, contraindications, drug interactions, safe dosage ranges, and how to spot adulterated products.', category: 'Herb Profiles', languages: ['English', 'Hausa', 'Pidgin'], readTime: '12 min', downloadable: true, featured: true, emoji: '🌿' },
    { slug: 'bitter-leaf-guide', title: 'Bitter Leaf (Vernonia amygdalina) — Safety & Interactions', description: 'Critical safety information for diabetic patients and anyone taking blood pressure medication. Includes updated dosage guidance.', category: 'Drug Interactions', languages: ['English', 'Igbo', 'Yoruba', 'Hausa', 'Pidgin'], readTime: '10 min', downloadable: true, featured: true, emoji: '🍃' },
    { slug: 'self-medication-safety', title: 'Safe Herbal Self-Medication — A Guide for Everyday Nigerians', description: 'Practical guidance on how to evaluate herbal products before buying, what questions to ask sellers, how to read labels, and when to see a professional.', category: 'Safe Use', languages: ['English', 'Pidgin'], readTime: '8 min', downloadable: true, featured: false, emoji: '🛡️' },
    { slug: 'pregnancy-herbs-nigeria', title: 'Herbs to Avoid During Pregnancy — Nigerian Edition', description: 'A clear reference for expectant mothers on which traditional Nigerian herbs carry documented pregnancy risks.', category: 'Condition-Specific', languages: ['English', 'Igbo', 'Yoruba', 'Hausa'], readTime: '14 min', downloadable: true, featured: false, emoji: '🤰' },
    { slug: 'coa-guide-producers', title: 'Understanding Certificates of Analysis (COA) — Producer Guide', description: 'A step-by-step guide for Nigerian herbal producers on what a valid COA must include and how HerbRx reviews submissions.', category: 'For Producers', languages: ['English'], readTime: '15 min', downloadable: true, featured: false, emoji: '🏭' },
    { slug: 'reading-herbal-labels', title: 'How to Read a Herbal Product Label in Nigeria', description: 'A plain-language guide to decoding herbal product labels: NAFDAC numbers, standardised extracts, red-flag claims, and what\'s missing from most labels.', category: 'Safe Use', languages: ['English', 'Pidgin', 'Yoruba'], readTime: '7 min', downloadable: true, featured: false, emoji: '🏷️' },
    { slug: 'diabetes-herbs', title: 'Managing Diabetes with Herbs — What the Evidence Says', description: 'An evidence-based review of herbs commonly used for blood sugar management in Nigeria.', category: 'Condition-Specific', languages: ['English', 'Hausa'], readTime: '16 min', downloadable: true, featured: false, emoji: '🩺' },
  ]

  for (const g of guides) {
    await prisma.safetyGuide.upsert({
      where:  { slug: g.slug },
      update: g,
      create: { ...g, isPublished: true },
    })
    console.log(`  ✓ Guide: ${g.title.slice(0, 50)}…`)
  }

  // ── Press Items ────────────────────────────────────────────────────────
  const pressItems = [
    { type: 'COVERAGE' as const, outlet: 'TechCabal', headline: "This Nigerian startup is making herbal medicine safer through science — and it's free", excerpt: 'HerbRx has quietly built the most comprehensive database of Nigerian herb safety data.', category: 'Feature', href: '#', date: new Date('2025-03-01'), isPublished: true },
    { type: 'COVERAGE' as const, outlet: 'BusinessDay', headline: 'The ₦60bn herbal medicine market has a safety problem. HerbRx wants to fix it.', excerpt: 'As Nigeria\'s traditional medicine industry grows, HerbRx is using pharmacognosy and tech to ensure consumer safety.', category: 'Interview', href: '#', date: new Date('2025-01-01'), isPublished: true },
    { type: 'COVERAGE' as const, outlet: 'Channels TV', headline: 'HerbRx pharmacists speak out on rising counterfeit herbal products in Lagos', category: 'Broadcast', href: '#', date: new Date('2024-11-01'), isPublished: true },
    { type: 'COVERAGE' as const, outlet: 'Ventures Africa', headline: 'African healthtech is going beyond hospitals — HerbRx is proof', category: 'Analysis', href: '#', date: new Date('2024-06-01'), isPublished: true },
    { type: 'RELEASE' as const, headline: 'HerbRx Launches Tier 2 Verified Producer Programme', date: new Date('2025-06-01'), isPublished: true },
    { type: 'RELEASE' as const, headline: 'HerbRx Issues Platform-Wide Safety Alert on Counterfeit Moringa Products', date: new Date('2025-04-01'), isPublished: true },
    { type: 'RELEASE' as const, headline: 'HerbRx Reaches 2,000 Nigerians Served, Publishes Annual Safety Impact Report', date: new Date('2025-02-01'), isPublished: true },
  ]

  for (const p of pressItems) {
    const exists = await prisma.pressItem.findFirst({ where: { headline: p.headline } })
    if (!exists) {
      await prisma.pressItem.create({ data: p })
      console.log(`  ✓ Press: ${p.headline.slice(0, 50)}…`)
    }
  }

  console.log('\n✅ Seed complete!')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })

