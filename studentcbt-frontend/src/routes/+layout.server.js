export async function load({ request, cookies }) {
  // Load auth state from cookies if available
  const authCookie = cookies.get('auth');
  
  return {
    auth: authCookie ? JSON.parse(authCookie) : null
  };
}
