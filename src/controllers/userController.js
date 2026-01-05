import prisma from '../config/prisma.js'

export const getAll = async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  res.json({
    success: true,
    data: {
      total: users.length,
      users,
    },
  })
}

export const remove = async (req, res) => {
  const id = parseInt(req.params.id, 10)

  const user = await prisma.user.findUnique({ where: { id } })

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'Utilisateur non trouvé',
    })
  }

  // Empêcher la suppression de son propre compte
  if (user.id === req.user.userId) {
    return res.status(400).json({
      success: false,
      error: 'Vous ne pouvez pas supprimer votre propre compte',
    })
  }

  await prisma.user.delete({ where: { id } })

  res.status(204).send()
}
