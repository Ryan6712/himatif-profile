<script lang="ts">
        interface NavLink {
        name: string;
        path: string;
    }

    let { logoUrl } = $props()

    let navItems: NavLink[] = [
        {
            name: "home",
            path: "/"
        },
        {
            name: "member",
            path: "/member"
        },
        {
            name: "program kerja",
            path: "/proker"
        },
        {
            name: "devisi",
            path: "/devisi"
        }
    ]

</script>

<style>
    .footer-link {
        position: relative;
        transition: color var(--duration-normal) var(--ease-out-expo);
    }
    .footer-link:hover {
        color: var(--color-secondary);
    }
    .footer-link::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 0;
        height: 1.5px;
        background: var(--color-secondary);
        border-radius: 1px;
        transition: width var(--duration-normal) var(--ease-out-expo);
    }
    .footer-link:hover::after {
        width: 100%;
    }
</style>

<footer class="bg-surface text-primary-text pt-15 pb-10 relative overflow-hidden">
    <!-- Gradient border top -->
    <div class="absolute top-0 left-0 right-0 h-0.75 bg-linear-to-r from-primary via-secondary to-tertiary"></div>

    <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">

        <!-- Brand -->
        <div class="md:col-span-2">
            <!-- Logo 215x35 aspect ratio ~6:1 -->
            <img src={logoUrl} alt="" class="w-[215px] h-[35px] object-fill mb-3">
            <p class="text-sm leading-relaxed opacity-75">
                Himpunan Mahasiswa Teknologi Informasi ITB Yadika adalah wadah bagi mahasiswa Teknologi Informasi untuk berkolaborasi, mengeksplorasi, dan mengembangkan diri dalam bidang teknologi informasi. 
            </p>
        </div>

        <!-- Contact -->
        <div class="md:text-end">
            <h4 class="text-lg font-semibold text-title-text mb-4">Kontak</h4>
            <ul class="stack-sm text-sm">
                <li class="opacity-80 hover:opacity-100 transition-opacity">📍 Kampus ITB Yadika Bangil, Kec. Bangil, Pasuruan, Jawa Timur 67153</li>
                <li class="opacity-80 hover:opacity-100 transition-opacity">📞 0812-3456-7890</li>
                <li class="opacity-80 hover:opacity-100 transition-opacity">✉️ email@gmail.com</li>
            </ul>
        </div>
        <!-- Menu -->
        <div class="md:text-end">
            <h4 class="text-lg font-semibold text-title-text mb-4">Menu</h4>
            <ul class="stack-sm text-sm">
            {#each navItems as item, i (i)}
                <li><a href={item.path} class="footer-link capitalize">{item.name}</a></li>
            {/each}
            </ul>
        </div>

        </div>


        <!-- Divider -->
        <div class="mb-6 h-px bg-linear-to-r from-transparent via-secondary/40 to-transparent"></div>

        <!-- Bottom -->
        <div class="flex flex-col md:flex-row items-center justify-between text-sm opacity-60">
        <p>© 2026 HIMATIF ITB Yadika. All rights reserved.</p>
        <p>Dibuat dengan ❤️ oleh Devisi DBM</p>
        </div>
    </div>
</footer>
