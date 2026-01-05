import prisma from '../config/prisma.js'

export const showUsersPage = async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { id: 'asc' },
  })

  res.render('pages/admin/users', {
    users,
    error: req.query.error,
    success: req.query.success,
  })
}

export const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id, 10)

  const userToDelete = await prisma.user.findUnique({ where: { id } })

  if (!userToDelete) {
    return res.redirect('/admin/users?error=Utilisateur non trouve')
  }

  if (userToDelete.id === req.session.user.id) {
    return res.redirect(
      '/admin/users?error=Vous ne pouvez pas supprimer votre propre compte'
    )
  }

  await prisma.user.delete({ where: { id } })

  res.redirect('/admin/users?success=Utilisateur supprime avec succes')
}
