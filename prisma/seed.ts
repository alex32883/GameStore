import { PrismaClient, GameVisibility } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Очистка существующих данных
  await prisma.vote.deleteMany()
  await prisma.gameTag.deleteMany()
  await prisma.note.deleteMany()
  await prisma.game.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  // Создание пользователей
  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      name: 'John Doe',
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      name: 'Jane Smith',
    },
  })

  const user3 = await prisma.user.create({
    data: {
      email: 'user3@example.com',
      name: 'Bob Johnson',
    },
  })

  console.log('Created users')

  // Создание категорий
  const category1 = await prisma.category.create({
    data: {
      category: 'Action',
    },
  })

  const category2 = await prisma.category.create({
    data: {
      category: 'Puzzle',
    },
  })

  const category3 = await prisma.category.create({
    data: {
      category: 'Strategy',
    },
  })

  console.log('Created categories')

  // Создание тегов
  const tag1 = await prisma.tag.create({
    data: {
      name: 'multiplayer',
    },
  })

  const tag2 = await prisma.tag.create({
    data: {
      name: 'single-player',
    },
  })

  const tag3 = await prisma.tag.create({
    data: {
      name: 'cooperative',
    },
  })

  const tag4 = await prisma.tag.create({
    data: {
      name: 'competitive',
    },
  })

  console.log('Created tags')

  // Создание игр
  const game1 = await prisma.game.create({
    data: {
      ownerId: user1.id,
      title: 'Epic Adventure',
      content: 'An epic adventure game with amazing graphics',
      description: 'Explore a vast world full of mysteries',
      categoryId: category1.id,
      visibility: GameVisibility.PUBLIC,
      publishedAt: new Date(),
      tags: {
        create: [
          { tagId: tag1.id },
          { tagId: tag3.id },
        ],
      },
    },
  })

  const game2 = await prisma.game.create({
    data: {
      ownerId: user1.id,
      title: 'Puzzle Master',
      content: 'Solve challenging puzzles',
      description: 'Test your problem-solving skills',
      categoryId: category2.id,
      visibility: GameVisibility.PUBLIC,
      publishedAt: new Date(),
      tags: {
        create: [
          { tagId: tag2.id },
        ],
      },
    },
  })

  const game3 = await prisma.game.create({
    data: {
      ownerId: user2.id,
      title: 'Strategy Wars',
      content: 'Command your armies to victory',
      description: 'A strategic game of conquest',
      categoryId: category3.id,
      visibility: GameVisibility.PUBLIC,
      publishedAt: new Date(),
      tags: {
        create: [
          { tagId: tag1.id },
          { tagId: tag4.id },
        ],
      },
    },
  })

  const game4 = await prisma.game.create({
    data: {
      ownerId: user2.id,
      title: 'Private Game',
      content: 'This is a private game',
      description: 'Only the owner can see this',
      categoryId: category1.id,
      visibility: GameVisibility.PRIVATE,
      tags: {
        create: [
          { tagId: tag2.id },
        ],
      },
    },
  })

  console.log('Created games')

  // Создание голосов
  await prisma.vote.create({
    data: {
      userId: user2.id,
      gameId: game1.id,
      value: 1,
    },
  })

  await prisma.vote.create({
    data: {
      userId: user3.id,
      gameId: game1.id,
      value: 1,
    },
  })

  await prisma.vote.create({
    data: {
      userId: user1.id,
      gameId: game2.id,
      value: 1,
    },
  })

  await prisma.vote.create({
    data: {
      userId: user3.id,
      gameId: game3.id,
      value: 1,
    },
  })

  console.log('Created votes')

  // Создание заметок
  await prisma.note.create({
    data: {
      ownerId: user1.id,
      title: 'First Note',
    },
  })

  await prisma.note.create({
    data: {
      ownerId: user1.id,
      title: 'Second Note',
    },
  })

  await prisma.note.create({
    data: {
      ownerId: user2.id,
      title: 'Third Note',
    },
  })

  console.log('Created notes')
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
