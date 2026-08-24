<script>
	import { goto } from "$app/navigation";
	import { authClient } from "$lib/authClient";
	import { resolve } from "$app/paths";

    const handleLogOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    goto(resolve("/admin/login"))
                }
            }
        })
    }
</script>

<h1>anda di dashboard admin</h1>
<button onclick={handleLogOut}>logout</button>