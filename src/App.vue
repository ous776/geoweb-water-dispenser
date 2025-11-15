<script setup lang="ts">
import MapView from '@/components/MapView.vue';
</script>

<template>
	<div class="app-container">
		<header role="banner">
			<div class="header-wrapper">
				<h1>Water Dispenser Locations</h1>
				<p>Find water dispensers near you</p>
			</div>
		</header>

		<main role="main">
			<MapView />
		</main>

		<footer role="contentinfo">
			<p>&copy; 2025 Water Dispenser Map</p>
		</footer>
	</div>
</template>

<style scoped>
.app-container {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	width: 100%;
}

header {
	background-color: #2c3e50;
	color: white;
	padding: 1.5rem 1rem;
	text-align: center;
}

.header-wrapper h1 {
	margin: 0 0 0.5rem 0;
	font-size: clamp(1.5rem, 4vw, 2.5rem);
}

.header-wrapper p {
	margin: 0;
	font-size: clamp(0.9rem, 2vw, 1.1rem);
	opacity: 0.9;
}

main {
	flex: 1;
	display: flex;
	flex-direction: column;
}

footer {
	background-color: #34495e;
	color: white;
	text-align: center;
	padding: 1rem;
	font-size: 0.9rem;
}

footer p {
	margin: 0;
}

@media (max-width: 768px) {
	header {
		padding: 1rem 0.5rem;
	}
}
</style>
