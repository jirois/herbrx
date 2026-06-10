export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  author: string
  authorRole: string
  authorInitials: string
  date: string
  readTime: number
  emoji: string
  gradientFrom: string
  gradientTo: string
  featured?: boolean
  tags: string[]
}

export const blogPosts: BlogPost[] = [
  {
    id: 'b1',
    slug: '5-common-herbal-products-in-nigeria',
    title: '5 Common Herbal Products in Nigeria — Are They All Safe?',
    excerpt:
      'Discover 5 popular herbal remedies in Nigeria and learn which are safe — backed by real insights from HerbRx experts.',
    content: `
Herbal medicine is deeply woven into Nigerian culture. From the agbo jedi-jedi our grandmothers brewed to the packaged "detox" teas flooding Lagos pharmacies, Nigerians have always trusted plants to heal. But as the market grows, so does the risk.

## 1. Liver Tonic Blends

Liver detox products are the most searched herbal category in Nigeria. Many contain Milk Thistle (silymarin) — a genuinely hepatoprotective compound with decades of clinical research. The danger? Adulterated versions that add undisclosed pharmaceuticals like prednisolone to create fast "results."

**HerbRx verdict:** Look for single-ingredient silymarin extracts with third-party testing certificates. Avoid blends with undisclosed "proprietary formulas."

## 2. Moringa Products

Moringa oleifera is legitimately one of the most nutrient-dense plants on earth. Nigerian soil-grown Moringa often outperforms imported versions in iron and vitamin C content. The problem is inconsistent processing — poorly dried Moringa rapidly loses its chlorophyll and active compounds.

**HerbRx verdict:** Buy from brands that publish harvest and processing dates. Capsules should be green-grey, not brown.

## 3. Blood Sugar Teas

Bitter leaf (Vernonia amygdalina) and scent leaf (Ocimum gratissimum) have real hypoglycaemic evidence in literature. But unregulated blood sugar teas present a genuine danger to diabetics on medication — dangerous hypoglycaemia is possible.

**HerbRx verdict:** Always inform your doctor. Never replace prescribed medication with herbal alternatives without supervision.

## 4. Anti-malarial Herbs

Artemisia annua (sweet wormwood) products are sold widely as malaria "prevention." While artemisinin derivatives are the backbone of modern malaria treatment, whole-plant Artemisia extracts have inconsistent artemisinin content and no standardised dosing.

**HerbRx verdict:** For malaria treatment, use artemisinin-combination therapies (ACTs) as prescribed. Herbs are not a replacement.

## 5. Weight Loss Teas

This is the category with the most red flags. Many "slimming teas" in Nigeria contain undisclosed senna (a potent laxative) or sibutramine — a banned weight-loss drug. Short-term weight loss from these products is water loss, not fat.

**HerbRx verdict:** Avoid any product promising rapid weight loss. If you see "lose 10kg in 2 weeks," walk away.

---

The rule of thumb: the more dramatic the claim, the more skeptical you should be. Real herbal medicine works gradually, in synergy with lifestyle, not against physics.
    `.trim(),
    category: 'Safety Guide',
    author: 'Dr. Amaka Osei',
    authorRole: 'Herbal Pharmacist',
    authorInitials: 'AO',
    date: '2025-07-12',
    readTime: 6,
    emoji: '🌿',
    gradientFrom: '#2D5A3D',
    gradientTo: '#4A7C59',
    featured: true,
    tags: ['Safety', 'Consumer Guide', 'Liver', 'Moringa', 'Blood Sugar'],
  },
  {
    id: 'b2',
    slug: 'how-to-tell-if-a-herbal-product-is-safe',
    title: 'How to Tell If a Herbal Product Is Safe in Nigeria',
    excerpt:
      'A practical checklist for Nigerian consumers navigating the herbal product market — before you buy.',
    content: `
Every week, Nigerians spend billions of naira on herbal products with no way to know whether what they're buying is safe. Here is a practical checklist.

## Check for NAFDAC Registration

Every legitimate herbal product sold in Nigeria must have a NAFDAC registration number. You can verify this at nafdac.gov.ng. If a product doesn't have one — or if the number doesn't verify — don't buy it.

## Read the Ingredient List

A legitimate product lists every ingredient, including amounts. Be wary of "proprietary blends" that don't disclose quantities. Natural doesn't mean safe — dosage matters.

## Look for Batch Numbers and Expiry Dates

Herbal products degrade over time, sometimes producing harmful compounds. If a product has no expiry date or batch number, the manufacturer cannot be held accountable.

## Research the Brand

Does the brand have a functioning website? A customer service number that works? Physical address? Unregistered brands often disappear after complaints.

## Watch for Red-Flag Claims

Phrases like "cures cancer," "reverses diabetes," or "100% guaranteed" are red flags. No herbal product can legally make drug claims in Nigeria.
    `.trim(),
    category: 'Consumer Tips',
    author: 'Tunde Adesanya',
    authorRole: 'Health Journalist',
    authorInitials: 'TA',
    date: '2025-06-20',
    readTime: 4,
    emoji: '🧪',
    gradientFrom: '#B8832A',
    gradientTo: '#D4A85C',
    tags: ['NAFDAC', 'Consumer Safety', 'Buying Guide'],
  },
  {
    id: 'b3',
    slug: 'moringa-benefits-risks-research',
    title: 'Moringa: Benefits, Risks, and What the Research Actually Says',
    excerpt:
      'Moringa is called a superfood, a miracle tree, and more. Here is what peer-reviewed science actually shows.',
    content: `
Moringa oleifera is one of the most studied medicinal plants in tropical medicine. Grown widely across Northern and South-Western Nigeria, it has been used for generations. But what does the evidence actually say?

## The Proven Benefits

**Nutritional density:** Moringa leaves contain more iron per gram than spinach, more calcium than milk (gram for gram), and complete amino acids — rare in plant foods.

**Anti-inflammatory:** Multiple studies show oleanolic acid and quercetin in Moringa suppress inflammatory markers (IL-6, TNF-α) in vitro. Clinical evidence in humans is emerging but not definitive.

**Blood sugar modulation:** A 2019 randomised trial showed 4g/day of Moringa leaf powder reduced post-meal blood glucose by 21% in pre-diabetic adults. Promising — but not a replacement for medication.

## The Risks

**Drug interactions:** Moringa has mild blood-thinning properties and may interact with warfarin.

**Thyroid interference:** High doses can suppress thyroid function — a concern for those already on thyroid medication.

**Seed and root:** While leaves are safe, Moringa seeds and root bark contain spirochin — a potentially toxic compound. Avoid these parts.

## The Verdict

Moringa is a legitimate nutritional supplement with genuine evidence. Buy whole-leaf powder or capsules from verified sources. Don't use it to replace prescribed medication. At normal food doses (2–5g/day), it's safe for most adults.
    `.trim(),
    category: 'Herb Guide',
    author: 'Dr. Amaka Osei',
    authorRole: 'Herbal Pharmacist',
    authorInitials: 'AO',
    date: '2025-05-15',
    readTime: 5,
    emoji: '🌱',
    gradientFrom: '#4A7C59',
    gradientTo: '#2D5A3D',
    tags: ['Moringa', 'Research', 'Nutrition', 'Evidence-Based'],
  },
  {
    id: 'b4',
    slug: 'nafdac-herbal-registration-guide-producers',
    title: 'A Producer\'s Guide to Getting Your Herbal Product NAFDAC Registered',
    excerpt:
      'Navigating NAFDAC registration for herbal products in Nigeria — a practical step-by-step for small producers.',
    content: `
Registering a herbal product with NAFDAC is one of the biggest barriers for small producers in Nigeria. The process is real and achievable — but it requires preparation.

## Step 1: Product Classification

First, determine whether your product is a food supplement, herbal medicine, or traditional medicine. This affects which regulatory pathway you follow.

## Step 2: Facility Registration

Your production facility must meet GMP (Good Manufacturing Practice) standards. NAFDAC will inspect before product registration. Start this process first — it takes 3–6 months.

## Step 3: Documentation Package

You'll need: product formulation, safety data, stability testing, label artwork (compliant with NAFDAC label guidelines), and proof of ingredient sourcing.

## Step 4: Application Submission

Submit via the NAFDAC e-Registration portal. Fees vary by product category (approx ₦50,000–₦200,000 for herbal products). Processing typically takes 90–180 days.

## Step 5: Product Testing

NAFDAC will take product samples for independent laboratory testing. Ensure your product meets the specifications in your submitted formulation.

## HerbRx Can Help

Our Producer Consultancy service guides small producers through this entire process — from formulation review to documentation preparation.
    `.trim(),
    category: 'For Producers',
    author: 'HerbRx Team',
    authorRole: 'Regulatory Affairs',
    authorInitials: 'HX',
    date: '2025-04-08',
    readTime: 7,
    emoji: '📋',
    gradientFrom: '#C8DABB',
    gradientTo: '#4A7C59',
    tags: ['NAFDAC', 'Producers', 'Registration', 'Regulatory'],
  },
  {
    id: 'b5',
    slug: 'bitter-leaf-evidence-traditional-use',
    title: 'Bitter Leaf (Ewuro): Traditional Use Meets Modern Evidence',
    excerpt:
      'Vernonia amygdalina is one of Nigeria\'s most versatile herbs. Here is what we know about it.',
    content: `
Ask any Yoruba grandmother and she'll tell you that ewuro — bitter leaf — cures everything. That's an exaggeration, but the science is more interesting than most people expect.

## Traditional Uses

Bitter leaf has documented traditional use across all major Nigerian ethnic groups — for malaria, worm infestations, liver problems, diabetes, and skin conditions.

## What Research Confirms

**Antimalarial activity:** Vernonia amygdalina extracts show activity against Plasmodium falciparum in laboratory studies. Not a replacement for artemisinin-based therapy, but worth further clinical investigation.

**Blood glucose reduction:** Multiple animal studies and at least two small human trials confirm hypoglycaemic effects. Mechanism appears to involve insulin sensitisation and alpha-glucosidase inhibition.

**Hepatoprotective effects:** Sesquiterpene lactones in bitter leaf protect liver cells against oxidative stress in vitro. This is the most consistently replicated finding.

## Safe Use Guidelines

As a food: regular consumption of fresh bitter leaf (in soups, etc.) at culinary quantities is safe for most people. As a supplement: standardised extracts are preferred for predictable dosing.

Drug interactions: combine with caution with antidiabetic medications, anticoagulants, and immunosuppressants.
    `.trim(),
    category: 'Herb Guide',
    author: 'Dr. Funmi Adeyemi',
    authorRole: 'Ethnopharmacologist',
    authorInitials: 'FA',
    date: '2025-03-22',
    readTime: 5,
    emoji: '🌼',
    gradientFrom: '#C2DDD5',
    gradientTo: '#9BCABB',
    tags: ['Bitter Leaf', 'Ewuro', 'Malaria', 'Traditional Medicine'],
  },
  {
    id: 'b6',
    slug: 'zobo-hibiscus-blood-pressure-evidence',
    title: 'Zobo and Blood Pressure: The Science Behind Nigeria\'s Favourite Drink',
    excerpt:
      'Hibiscus sabdariffa has more clinical evidence behind it than almost any other traditional Nigerian remedy.',
    content: `
Zobo — the deep crimson drink made from dried hibiscus calyces — is enjoyed across Nigeria as a refreshing beverage. What many don't know is that it may be one of the most evidence-backed traditional drinks for cardiovascular health.

## The Evidence

A 2010 study in the Journal of Nutrition found that three cups of hibiscus tea daily reduced systolic blood pressure by 7mmHg in prehypertensive adults. A Cochrane review in 2015 confirmed antihypertensive effects across multiple trials.

The mechanism is anthocyanins — the compounds that give Zobo its red colour. These act as ACE inhibitors, relaxing blood vessels.

## Nigerian Zobo vs Commercial Hibiscus Tea

Local sun-dried Zobo flowers from Kano and Sokoto are typically higher in anthocyanins than mass-produced international varieties. The natural drying process preserves compounds better than heat-drying.

## Important Caveat

Zobo can significantly potentiate antihypertensive medications — meaning if you're already on blood pressure drugs, adding Zobo could lower your pressure dangerously. Always inform your doctor.

## Safe Daily Use

For healthy adults: 1–2 glasses of unsweetened Zobo daily is safe and may confer real cardiovascular benefit. For those on BP medication: consult your doctor first.
    `.trim(),
    category: 'Herb Guide',
    author: 'Tunde Adesanya',
    authorRole: 'Health Journalist',
    authorInitials: 'TA',
    date: '2025-02-14',
    readTime: 4,
    emoji: '🌺',
    gradientFrom: '#F5C4C4',
    gradientTo: '#E8A0A0',
    tags: ['Zobo', 'Hibiscus', 'Blood Pressure', 'Heart Health'],
  },
]

export const blogCategories = [
  'All',
  'Safety Guide',
  'Consumer Tips',
  'Herb Guide',
  'For Producers',
]

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug)
}

export function getFeaturedPost(): BlogPost | undefined {
  return blogPosts.find((p) => p.featured)
}

export function getRecentPosts(limit = 3, excludeSlug?: string): BlogPost[] {
  return blogPosts
    .filter((p) => p.slug !== excludeSlug)
    .slice(0, limit)
}
