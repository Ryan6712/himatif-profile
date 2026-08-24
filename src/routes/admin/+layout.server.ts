import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, url }) => {
  // Jangan redirect di halaman login
  if (url.pathname === "/admin/login") {
    return {};
  }

  // Redirect ke login jika belum authenticated
  if (!locals.user) {
    throw redirect(302, "/admin/login");
  }

  // Pass user data ke semua child routes
  return {
    user: locals.user,
  };
};