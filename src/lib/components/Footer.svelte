<script lang="ts">
        interface NavLink {
        name: string;
        path: string;
    }

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
            name: "proker",
            path: "/proker"
        },
        {
            name: "devisi",
            path: "/devisi"
        }
    ]

</script>


<footer class="bg-surface text-primary-text pt-15 pb-10 border-t-2 border-primary">
    <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">

        <!-- Brand -->
        <div class="md:col-span-2">
            <img src="https://placehold.co/215x35/png?text=himatif" alt="" class="w-auto h-8 mb-2">
            <p class="text-sm text-text-muted">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Repudiandae, 
            </p>
        </div>

        <!-- Contact -->
        <div class="md:text-end">
            <h4 class="text-lg font-semibold text-title-text mb-4">Kontak</h4>
            <ul class="stack-sm text-sm">
                <li>📍 Kampus ITB Yadika Bangil, Kec. Bangil, Pasuruan, Jawa Timur 67153</li>
                <li>📞 0812-3456-7890</li>
                <li>✉️ email@gmail.com</li>
            </ul>
        </div>
        <!-- Menu -->
        <div class="md:text-end">
            <h4 class="text-lg font-semibold text-title-text mb-4">Menu</h4>
            <ul class="stack-sm text-sm">
            {#each navItems as item}
                <li><a href={item.path} class="hover:text-secondary capitalize">{item.name}</a></li>
            {/each}
            </ul>
        </div>

        </div>


        <!-- Divider -->
        <div class="border-t border-dashed border-secondary mb-6"></div>

        <!-- Bottom -->
        <div class="flex flex-col md:flex-row items-center justify-between text-sm text-text-muted">
        <p>© 2026 HIMATIF ITB Yadika. All rights reserved.</p>
        <p>Dibuat dengan ❤️ oleh Devisi DBM</p>
        </div>
    </div>
</footer>

