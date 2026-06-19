// import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs'


// const prisma = new PrismaClient()
import {prisma} from '@/lib/prisma'

async function main(){
  console.log('🌿 Seeding HerbRx database…')

  // Admin / test user
  const passwordHash = await bcrypt.hash('test1234', 12)
  const admin = await prisma.user.upsert({
    where: {email: 'test@herbrx.ng'},
    update: {},
    create: {
        email:   "test@herbrx.ng",
        firstName: 'Omas',
        lastName: 'Akpos',
        phone:     '08012345678',
        passwordHash,
        emailVerified: true,
        role:       'ADMIN'
    }
  })
  console.log('✓ Admin user:', admin.email)

  // -- Sample customer
  const customer = await prisma.user.upsert({
     where:  { email: 'customer@example.com' },
    update: {},
    create: {
      email:         'customer@example.com',
      firstName:     'Ngozi',
      lastName:      'Eze',
      phone:         '08087654321',
      passwordHash:  await bcrypt.hash('customer123', 12),
      emailVerified: true,
      role:          'CUSTOMER',
    },
  })
  console.log('  ✓ Customer user:', customer.email)

  // Sample orders
  const sampleOrders = [
    {
      id:           'ORD-SEED-001',
      userId:       customer.id,
      paystackRef:  'HRX-SEED-ABC123',
      custFirstName:'Ngozi',
      custLastName: 'Eze',
      custEmail:    'customer@example.com',
      custPhone:    '08087654321',
      custAddress:  '7 Trans Amadi',
      custCity:     'Port Harcourt',
      custState:    'Rivers',
      subtotal:     450000,  // ₦4,500 in kobo
      shipping:     250000,
      total:        700000,  // ₦7,000
      paymentMethod:'CARD'   as const,
      paymentStatus:'PAID'   as const,
      status:       'DELIVERED' as const,
      items: {
        create: [
          {
            productId:    'liver-cleanse-blend',
            productName:  'Liver Cleanse Blend',
            productEmoji: '🌿',
            price:        450000,
            quantity:     1,
          },
        ],
      },

    },

    {
      id:           'ORD-SEED-002',
      userId:       customer.id,
      paystackRef:  'HRX-SEED-DEF456',
      custFirstName:'Ngozi',
      custLastName: 'Eze',
      custEmail:    'customer@example.com',
      custPhone:    '08087654321',
      custAddress:  '7 Trans Amadi',
      custCity:     'Port Harcourt',
      custState:    'Rivers',
      subtotal:     620000,
      shipping:     0,
      total:        620000,
      paymentMethod:'CARD'   as const,
      paymentStatus:'PAID'   as const,
      status:       'SHIPPED' as const,
      items: {
        create: [
          {
            productId:    'moringa-gold-capsules',
            productName:  'Moringa Gold Capsules',
            productEmoji: '🫚',
            price:        620000,
            quantity:     1,
          },
        ],
      },
    },
  ]
  for (const order of sampleOrders) {
    await prisma.order.upsert({
      where:  { id: order.id },
      update: {},
      create: order,
    })
  }

  console.log('  ✓ Sample orders seeded')

  console.log('\n✅ Seed complete!')
  console.log('\n   Login with:')
  console.log('   Admin:    test@herbrx.ng       / test1234')
  console.log('   Customer: customer@example.com / customer123')

 
}

 main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
