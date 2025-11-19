<script>
	import { page } from '$app/stores';
	import ExamInterface from '$lib/components/student/ExamInterface.svelte';

	let assessmentId = $derived($page.params.id);
</script>

<ExamInterface {assessmentId} />
