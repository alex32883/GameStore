import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const notes = [
    { title: 'First Note' },
    { title: 'Second Note' },
    { title: 'Third Note' },
  ]

  for (const note of notes) {
    await prisma.note.create({
      data: note,
    })
  }

  console.log('Seeding finished!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
