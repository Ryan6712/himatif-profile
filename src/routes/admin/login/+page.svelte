<script lang="ts">
	import { goto } from "$app/navigation";
	import { authClient } from "$lib/authClient";
	import { resolve } from "$app/paths";
    import { LogIn, Loader2 } from "@lucide/svelte"; //pakai @lucide/svelte bukan lucide-svelte kita pakai versi terbaru

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
        errorMessage = ''; // reset error

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

<div class="min-h-screen w-full flex items-center justify-center bg-gradient-surface relative overflow-hidden px-4">
    <!-- Subtle dot pattern overlay -->
    <div class="absolute inset-0 bg-dot-pattern pointer-events-none"></div>
    
    <!-- PENGGUNAAN UTILITY CLASS SESUAI DESIGN PATTERN -->
    <div class="glass-card rounded p-8 md:p-10 w-full max-w-md relative z-10 flex flex-col gap-6 group hover-lift" style="box-shadow: var(--shadow-card-xl);">
        
        <div class="header text-center flex flex-col gap-2">
            <h1 class="text-3xl font-extrabold text-title-text tracking-tight">Admin <span class="gradient-text">Panel</span></h1>
            <p class="text-sm opacity-70 text-primary-text">Login untuk mengakses dashboard HIMATIF</p>
        </div>

        <form onsubmit={handleLogin} class="flex flex-col stack mt-2">
            <div class="form-control flex flex-col gap-2">
                <label for="userInput" class="text-sm font-semibold text-primary-text opacity-90">Email / Username</label>
                <!-- Menghilangkan styling border putih transparan, diganti yang lebih kalem -->
                <input 
                    type="text" 
                    id="userInput"
                    name="userInput" 
                    bind:value={rawInput}
                    placeholder="admin atau admin@himatif.ac.id"
                    required
                    class="px-4 py-3 rounded border border-primary/20 bg-background/80 text-title-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary smooth-transition"
                >
            </div>
            
            <div class="form-control flex flex-col gap-2">
                <label for="password" class="text-sm font-semibold text-primary-text opacity-90">Password</label>
                <input 
                    type="password" 
                    id="password"
                    name="password" 
                    bind:value={passwordValue}
                    placeholder="••••••••"
                    required
                    class="px-4 py-3 rounded border border-primary/20 bg-background/80 text-title-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary smooth-transition"
                >
            </div>

            {#if errorMessage}
                <div class="bg-red-50 text-red-500 text-sm px-4 py-3 rounded border border-red-200 mt-2">
                    {errorMessage}
                </div>
            {/if}

            <button 
                type="submit" 
                disabled={isLoading || !rawInput || !passwordValue} 
                class="btn-cta py-3 px-4 mt-4 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full rounded-full"
            >
                {#if isLoading}
                    <Loader2 class="w-5 h-5 animate-spin" />
                    <span>Memproses...</span>
                {:else}
                    <span>Masuk Dashboard</span>
                    <LogIn class="w-5 h-5" />
                {/if}
            </button>
        </form>

        <div class="text-center mt-2">
            <a href="/" class="text-sm text-secondary font-semibold hover:opacity-100 opacity-80 smooth-transition">&larr; Kembali ke Beranda</a>
        </div>
    </div>
</div>