<script>
	import { page } from '$app/stores';
	import { ChevronRight, Home } from 'lucide-svelte';

	export let items = [];

	$: currentPath = $page.url.pathname;
	
	// Auto-generate breadcrumbs if not provided
	$: autoBreadcrumbs = (() => {
		if (items.length > 0) return items;
		
		const pathSegments = currentPath.split('/').filter(Boolean);
		const breadcrumbs = [];
		
		// Add home
		breadcrumbs.push({
			label: 'Home',
			href: pathSegments[0] === 'admin' ? '/admin' : '/student',
			icon: Home
		});
		
		let currentHref = '';
		pathSegments.forEach((segment, index) => {
			currentHref += '/' + segment;
			
			// Skip the role segment (admin/student)
			if (index === 0) return;
			
			// Format segment name
			const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
			
			breadcrumbs.push({
				label,
				href: currentHref,
				current: index === pathSegments.length - 1
			});
		});
		
		return breadcrumbs;
	})();

	$: displayBreadcrumbs = autoBreadcrumbs.length > 1 ? autoBreadcrumbs : [];
</script>

{#if displayBreadcrumbs.length > 0}
	<nav class="flex mb-6" aria-label="Breadcrumb">
		<ol role="list" class="flex items-center space-x-2">
			{#each displayBreadcrumbs as breadcrumb, index}
				<li class="flex items-center">
					{#if index > 0}
						<ChevronRight class="h-4 w-4 text-gray-400 mx-2" />
					{/if}
					
					{#if breadcrumb.current}
						<span class="text-sm font-medium text-gray-900 flex items-center">
							{#if breadcrumb.icon}
								<svelte:component this={breadcrumb.icon} class="h-4 w-4 mr-1" />
							{/if}
							{breadcrumb.label}
						</span>
					{:else}
						<a 
							href={breadcrumb.href} 
							class="text-sm text-gray-500 hover:text-gray-700 flex items-center transition-colors"
						>
							{#if breadcrumb.icon}
								<svelte:component this={breadcrumb.icon} class="h-4 w-4 mr-1" />
							{/if}
							{breadcrumb.label}
						</a>
					{/if}
				</li>
			{/each}
		</ol>
	</nav>
{/if}