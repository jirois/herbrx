import type { Order } from '@/types'

export function getRevenueByDay(orders: Order[], days = 90) {
  const result: { date: string; revenue: number; orders: number }[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d   = new Date(now); d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const day = orders.filter(o => o.createdAt.slice(0,10) === key && o.paymentStatus === 'paid')
    result.push({ date: key, revenue: day.reduce((s,o)=>s+o.total,0), orders: day.length })
  }
  return result
}

export function getTopProducts(orders: Order[], limit = 5) {
  const map: Record<string,{ name:string; emoji:string; revenue:number; qty:number }> = {}
  orders.forEach(o => {
    if (o.paymentStatus !== 'paid') return
    o.items.forEach(item => {
      const id = item.product.id
      if (!map[id]) map[id] = { name:item.product.name, emoji:item.product.emoji ?? '🏷️', revenue:0, qty:0 }
      map[id].revenue += item.product.price * item.quantity
      map[id].qty     += item.quantity
    })
  })
  return Object.values(map).sort((a,b)=>b.revenue-a.revenue).slice(0, limit)
}

export function getDashboardStats(orders: Order[]) {
  const paid      = orders.filter(o => o.paymentStatus === 'paid')
  const now       = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonth = new Date(now.getFullYear(), now.getMonth()-1, 1)

  const thisRev   = paid.filter(o => new Date(o.createdAt) >= thisMonth).reduce((s,o)=>s+o.total,0)
  const lastRev   = paid.filter(o => new Date(o.createdAt)>=lastMonth && new Date(o.createdAt)<thisMonth).reduce((s,o)=>s+o.total,0)
  const revChange = lastRev>0 ? Math.round(((thisRev-lastRev)/lastRev)*1000)/10 : 0

  const thisOrds  = orders.filter(o=>new Date(o.createdAt)>=thisMonth).length
  const lastOrds  = orders.filter(o=>new Date(o.createdAt)>=lastMonth&&new Date(o.createdAt)<thisMonth).length
  const ordChange = lastOrds>0 ? Math.round(((thisOrds-lastOrds)/lastOrds)*1000)/10 : 0

  const emails    = new Set(orders.map(o=>o.customer.email))
  const newEmails = new Set(orders.filter(o=>new Date(o.createdAt)>=thisMonth).map(o=>o.customer.email))

  return {
    totalRevenue:    paid.reduce((s,o)=>s+o.total,0),
    thisMonthRev:    thisRev,
    revChange,
    totalOrders:     orders.length,
    thisMonthOrders: thisOrds,
    ordChange,
    totalCustomers:  emails.size,
    newCustomers:    newEmails.size,
    pendingOrders:   orders.filter(o=>o.status==='pending'||o.status==='processing').length,
    failedPayments:  orders.filter(o=>o.paymentStatus==='failed').length,
    avgOrderValue:   paid.length>0 ? Math.round(paid.reduce((s,o)=>s+o.total,0)/paid.length) : 0,
  }
}

export function generateSeedOrders(): Order[] {
  const prods = [
    {
      id:'liver-cleanse-blend', name:'Liver Cleanse Blend', emoji:'🌿', price:4500, gF:'#C8DABB', gT:'#A8C999',
      longDesc:'A calming herbal blend crafted to support daily wellness and digestive balance.',
      ingredients:['Milk Thistle', 'Dandelion Root', 'Turmeric'],
      warnings:['Consult a healthcare professional if pregnant or nursing.'],
      createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(),
    },
    {
      id:'moringa-gold-capsules', name:'Moringa Gold Capsules', emoji:'🫚', price:6200, gF:'#F5E8CE', gT:'#E8D0A0',
      longDesc:'Nutrient-rich moringa capsules designed to complement a healthy daily routine.',
      ingredients:['Moringa Leaf', 'Vitamin E'],
      warnings:['Keep out of reach of children.'],
      createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(),
    },
    {
      id:'ashwagandha-blend', name:'Ashwagandha Stress Relief', emoji:'🌱', price:5400, gF:'#D4C5E2', gT:'#B8A5CC',
      longDesc:'A soothing adaptogenic blend to help support stress relief and calm.',
      ingredients:['Ashwagandha Root', 'Chamomile'],
      warnings:['Do not exceed the recommended dosage.'],
      createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(),
    },
    {
      id:'bitter-leaf-tincture', name:'Bitter Leaf Tincture', emoji:'🌼', price:3800, gF:'#C2DDD5', gT:'#9BCABB',
      longDesc:'A concentrated tincture made from bitter leaf for everyday wellness support.',
      ingredients:['Bitter Leaf', 'Alcohol Base'],
      warnings:['Keep away from flame and store in a cool place.'],
      createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(),
    },
    {
      id:'zobo-hibiscus-tea', name:'Zobo Hibiscus Tea', emoji:'🌺', price:1800, gF:'#F5C4C4', gT:'#E8A0A0',
      longDesc:'A vibrant antioxidant-rich tea blend with refreshing hibiscus flavor.',
      ingredients:['Hibiscus', 'Cinnamon', 'Cloves'],
      warnings:['Avoid overconsumption if you are sensitive to caffeine.'],
      createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(),
    },
    {
      id:'shea-neem-balm', name:'Shea & Neem Balm', emoji:'🧴', price:2900, gF:'#EDE6D9', gT:'#DDD0BA',
      longDesc:'A nourishing balm crafted with shea and neem for skin comfort and care.',
      ingredients:['Shea Butter', 'Neem Extract'],
      warnings:['Patch test before use on sensitive skin.'],
      createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(),
    },
  ]
  const custs = [
    { firstName:'Chioma',   lastName:'Okafor',  email:'chioma@example.com',   phone:'08012345678', address:'5 Allen Ave',     city:'Lagos',         state:'Lagos'   },
    { firstName:'Emeka',    lastName:'Nwosu',   email:'emeka@example.com',    phone:'08098765432', address:'22 Wuse II',      city:'Abuja',         state:'FCT'     },
    { firstName:'Amina',    lastName:'Yusuf',   email:'amina@example.com',    phone:'07035566778', address:'15 Kano Road',    city:'Kano',          state:'Kano'    },
    { firstName:'Tokunbo',  lastName:'Adeyemi', email:'tokunbo@example.com',  phone:'08123456789', address:'8 Ring Road',     city:'Ibadan',        state:'Oyo'     },
    { firstName:'Blessing', lastName:'Eze',     email:'blessing@example.com', phone:'09012345678', address:'3 GRA',           city:'Enugu',         state:'Enugu'   },
    { firstName:'Sani',     lastName:'Ibrahim', email:'sani@example.com',     phone:'08076543210', address:'12 Sokoto Way',   city:'Kaduna',        state:'Kaduna'  },
    { firstName:'Ngozi',    lastName:'Obi',     email:'ngozi@example.com',    phone:'08087654321', address:'7 Trans Amadi',   city:'Port Harcourt', state:'Rivers'  },
    { firstName:'Femi',     lastName:'Adesanya',email:'femi@example.com',     phone:'07098765432', address:'20 Lekki Phase 1','city':'Lagos',       state:'Lagos'   },
  ]
  const statuses:    Order['status'][]        = ['delivered','delivered','delivered','shipped','confirmed','processing','pending','cancelled']
  const payStatuses: Order['paymentStatus'][] = ['paid','paid','paid','paid','paid','paid','pending','failed']
  const orders: Order[] = []
  const now = new Date()

  for (let i = 0; i < 120; i++) {
    const daysAgo = Math.floor(Math.random()*90)
    const d = new Date(now); d.setDate(d.getDate()-daysAgo); d.setHours(Math.floor(Math.random()*18)+6)
    const cust    = custs[Math.floor(Math.random()*custs.length)]
    const numI    = Math.floor(Math.random()*3)+1
    const items   = Array.from({ length:numI }, () => {
      const p   = prods[Math.floor(Math.random()*prods.length)]
      const qty = Math.floor(Math.random()*3)+1
      return {
        product:  {
          id:p.id, name:p.name, emoji:p.emoji, price:p.price,
          gradientFrom:p.gF, gradientTo:p.gT, type:'Capsules', badge:'Verified' as const,
          badgeVariant:'green' as const, rating:4.8, reviews:100, inStock:true,
          slug:p.id, shortDesc:'', tags:[], category:'Capsules', unit:'bottle',
          stockCount:50, featured:false,
          longDesc:p.longDesc, ingredients:p.ingredients, warnings:p.warnings,
          createdAt:p.createdAt, updatedAt:p.updatedAt,
        },
        quantity: qty,
      }
    })
    const subtotal = items.reduce((s,i)=>s+i.product.price*i.quantity,0)
    const shipping = subtotal>=15000 ? 0 : 2500
    const total    = subtotal+shipping
    const si       = Math.floor(Math.random()*statuses.length)
    orders.push({
      id: `ORD-${String(i).padStart(4,'0')}`,
      paystackRef:  `HRX-${d.getTime().toString(36).toUpperCase()}`,
      paystackTxId: Math.floor(Math.random()*9999999),
      items, customer: cust, subtotal, shipping, total,
      paymentMethod: 'card',
      paymentStatus: payStatuses[si],
      status:        statuses[si],
      createdAt:     d.toISOString(),
    })
  }
  return orders.sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime())
}

let _seed: Order[] | null = null
export function getSeedOrders(): Order[] {
  if (!_seed) _seed = generateSeedOrders()
  return _seed
}
