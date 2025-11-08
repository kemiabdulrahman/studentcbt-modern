<script>
	import { page } from '$app/stores';
	import ExamInterface from '$lib/components/student/ExamInterface.svelte';

	$: assessmentId = $page.params.id;
</script>

<ExamInterface {assessmentId} />
