<script lang="ts">
	import { goto } from "$app/navigation";
	import { authClient } from "$lib/authClient";
	import { resolve } from "$app/paths";


    let rawInput: string = $state('')
    let usernameValue: string = $state('');
    let emailValue: string = $state('');
    let passwordValue: string = $state('');

    $effect(() => {

        if(!rawInput) {
            emailValue = ""
            usernameValue = ""
            return;
        }


        if(rawInput.includes('@')) {
            emailValue = rawInput
            usernameValue = ""
        } else {
            usernameValue = rawInput
            emailValue = ""
        }
    })


    let isLoading = $state(false)
    let errorMessage= $state('')

    const handleLogin = async (e: SubmitEvent) => {
        e.preventDefault();
        isLoading = true;

        try {
                if(emailValue){
                    await authClient.signIn.email(
                        {
                            email: emailValue,
                            password: passwordValue
                        },
                        {
                            onSuccess: (): void => {
                                goto(resolve('/admin/dashboard'))
                            },
                            onError: (ctx) => {
                                errorMessage = ctx.error.message;
                            }
                        }
                    )
                } else {
                    await authClient.signIn.username(
                        {
                            username: usernameValue,
                            password: passwordValue
                        },
                        {
                            onSuccess: (): void => {
                                goto(resolve('/admin/dashboard'))
                            },
                            onError: (ctx) => {
                                errorMessage = ctx.error.message;
                            }
                        }
                    )
                }
        } finally {
            isLoading = false

        }

        
    }
</script>

<div class="form_login">
    <form 
    onsubmit={handleLogin}
    >
        <label for="userInput">Masukkan username atau email</label>
        <input type="text" name="userInput" bind:value={rawInput}>
        <label for="password">masukkan password</label>
        <input type="password" name="password" bind:value={passwordValue}>
        <button type="submit" disabled={isLoading} class:bg-red-500={isLoading}>login</button>

        {#if errorMessage}
            <p>{errorMessage}</p>
        {/if}
    </form>
</div>