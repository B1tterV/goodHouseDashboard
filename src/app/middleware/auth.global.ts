export default defineNuxtRouteMiddleware((to) => {
  const { status } = useAuth()

  if (status.value === 'authenticated' && to.path === '/login') {
    return navigateTo('/')
  }
})
