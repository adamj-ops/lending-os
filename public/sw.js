// Service Worker for Lending OS Inspector PWA
const _CACHE_NAME = "lending-os-inspector-v1"; // Reserved for future use
const STATIC_CACHE = "static-cache-v1";
const DYNAMIC_CACHE = "dynamic-cache-v1";

// Files to cache for offline functionality
// Note: Icon files removed temporarily until they are created
// They will be re-added once icons are available
const STATIC_FILES = [
	"/",
	"/inspector",
	"/inspector/new",
	"/inspector/pending",
	"/manifest.json",
	// Icon files temporarily removed - will be re-added once created:
	// '/icons/icon-192x192.png',
	// '/icons/icon-512x512.png'
];

// API endpoints to cache for offline sync
// Reserved for future pattern-based matching
const _API_CACHE_PATTERNS = [
	/\/api\/v1\/inspections/,
	/\/api\/v1\/draws/,
	/\/api\/v1\/loans/,
];

// Install event - cache static files
self.addEventListener("install", (event) => {
	console.log("Service Worker installing...");

	event.waitUntil(
		caches
			.open(STATIC_CACHE)
			.then((cache) => {
				console.log("Caching static files...");

				// Cache files individually to handle missing files gracefully
				// Use Promise.allSettled to continue even if some files fail
				const cachePromises = STATIC_FILES.map((url) => {
					return fetch(url)
						.then((response) => {
							if (response.ok) {
								return cache.put(url, response.clone()).then(() => {
									console.log(`✓ Cached: ${url}`);
									return { url, status: "success" };
								});
							} else {
								console.warn(
									`⚠ Failed to cache ${url}: ${response.status} ${response.statusText}`,
								);
								return {
									url,
									status: "failed",
									reason: `HTTP ${response.status}`,
								};
							}
						})
						.catch((err) => {
							console.warn(`⚠ Failed to cache ${url}:`, err.message);
							return { url, status: "failed", reason: err.message };
						});
				});

				return Promise.allSettled(cachePromises).then((results) => {
					const successful = results.filter(
						(r) => r.status === "fulfilled" && r.value.status === "success",
					).length;
					const failed = results.filter(
						(r) =>
							r.status === "rejected" ||
							(r.status === "fulfilled" && r.value.status === "failed"),
					).length;

					console.log(
						`Cache operation complete: ${successful} succeeded, ${failed} failed`,
					);

					// Continue installation even if some files failed
					return self.skipWaiting();
				});
			})
			.catch((err) => {
				console.error("Error opening cache:", err);
				// Still skip waiting to activate service worker
				return self.skipWaiting();
			}),
	);
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
	console.log("Service Worker activating...");

	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
							console.log("Deleting old cache:", cacheName);
							return caches.delete(cacheName);
						}
						return Promise.resolve(); // Return resolved promise if cache should be kept
					}),
				);
			})
			.then(() => {
				console.log("Service Worker activated");
				return self.clients.claim();
			}),
	);
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Skip non-GET requests
	if (request.method !== "GET") {
		return;
	}

	// Handle API requests with network-first strategy
	if (url.pathname.startsWith("/api/")) {
		event.respondWith(handleApiRequest(request));
		return;
	}

	// Handle static files with cache-first strategy
	if (isStaticFile(request)) {
		event.respondWith(handleStaticRequest(request));
		return;
	}

	// Handle navigation requests with network-first strategy
	if (request.mode === "navigate") {
		event.respondWith(handleNavigationRequest(request));
		return;
	}

	// Default: try network first, fallback to cache
	event.respondWith(handleDefaultRequest(request));
});

// API request handler - network first, cache fallback
async function handleApiRequest(request) {
	try {
		// Try network first
		const networkResponse = await fetch(request);

		// Cache successful responses
		if (networkResponse.ok) {
			const cache = await caches.open(DYNAMIC_CACHE);
			cache.put(request, networkResponse.clone());
		}

		return networkResponse;
	} catch (_error) {
		console.log("Network failed for API request, trying cache:", request.url);

		// Fallback to cache
		const cachedResponse = await caches.match(request);
		if (cachedResponse) {
			return cachedResponse;
		}

		// Return offline response for API requests
		return new Response(
			JSON.stringify({
				error: "Offline",
				message: "No internet connection. Data will sync when online.",
			}),
			{
				status: 503,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}

// Static file handler - cache first
async function handleStaticRequest(request) {
	const cachedResponse = await caches.match(request);

	if (cachedResponse) {
		return cachedResponse;
	}

	try {
		const networkResponse = await fetch(request);

		if (networkResponse.ok) {
			const cache = await caches.open(STATIC_CACHE);
			cache.put(request, networkResponse.clone());
		}

		return networkResponse;
	} catch (_error) {
		console.log("Failed to fetch static file:", request.url);
		return new Response("Offline", { status: 503 });
	}
}

// Navigation request handler - network first, cache fallback
async function handleNavigationRequest(request) {
	try {
		const networkResponse = await fetch(request);
		return networkResponse;
	} catch (_error) {
		console.log("Network failed for navigation, trying cache:", request.url);

		const cachedResponse = await caches.match("/inspector");
		return cachedResponse || new Response("Offline", { status: 503 });
	}
}

// Default request handler
async function handleDefaultRequest(request) {
	try {
		const networkResponse = await fetch(request);

		if (networkResponse.ok) {
			const cache = await caches.open(DYNAMIC_CACHE);
			cache.put(request, networkResponse.clone());
		}

		return networkResponse;
	} catch (_error) {
		const cachedResponse = await caches.match(request);
		return cachedResponse || new Response("Offline", { status: 503 });
	}
}

// Helper function to check if request is for static files
function isStaticFile(request) {
	const url = new URL(request.url);
	return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/);
}

// Background sync for offline data
self.addEventListener("sync", (event) => {
	console.log("Background sync triggered:", event.tag);

	if (event.tag === "inspection-sync") {
		event.waitUntil(syncInspections());
	} else if (event.tag === "photo-sync") {
		event.waitUntil(syncPhotos());
	}
});

// Sync pending inspections when back online
async function syncInspections() {
	try {
		// Get pending inspections from IndexedDB
		const pendingInspections = await getPendingInspections();

		for (const inspection of pendingInspections) {
			try {
				const response = await fetch("/api/v1/inspections", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(inspection),
				});

				if (response.ok) {
					// Remove from pending queue
					await removePendingInspection(inspection.id);
					console.log("Synced inspection:", inspection.id);
				}
			} catch (error) {
				console.error("Failed to sync inspection:", inspection.id, error);
			}
		}
	} catch (error) {
		console.error("Error during inspection sync:", error);
	}
}

// Sync pending photos when back online
async function syncPhotos() {
	try {
		// Get pending photos from IndexedDB
		const pendingPhotos = await getPendingPhotos();

		for (const photo of pendingPhotos) {
			try {
				const formData = new FormData();
				formData.append("photo", photo.file);
				formData.append("inspectionId", photo.inspectionId);
				formData.append("metadata", JSON.stringify(photo.metadata));

				const response = await fetch("/api/v1/inspections/photos", {
					method: "POST",
					body: formData,
				});

				if (response.ok) {
					// Remove from pending queue
					await removePendingPhoto(photo.id);
					console.log("Synced photo:", photo.id);
				}
			} catch (error) {
				console.error("Failed to sync photo:", photo.id, error);
			}
		}
	} catch (error) {
		console.error("Error during photo sync:", error);
	}
}

// IndexedDB helpers (simplified - in real implementation, use proper IndexedDB)
async function getPendingInspections() {
	// This would interact with IndexedDB to get pending inspections
	return [];
}

async function removePendingInspection(id) {
	// This would remove the inspection from IndexedDB
	console.log("Removed pending inspection:", id);
}

async function getPendingPhotos() {
	// This would interact with IndexedDB to get pending photos
	return [];
}

async function removePendingPhoto(id) {
	// This would remove the photo from IndexedDB
	console.log("Removed pending photo:", id);
}

// Push notification handler
self.addEventListener("push", (event) => {
	console.log("Push notification received:", event);

	const options = {
		body: "New inspection assigned to you",
		icon: "/icons/icon-192x192.png",
		badge: "/icons/badge-72x72.png",
		vibrate: [100, 50, 100],
		data: {
			dateOfArrival: Date.now(),
			primaryKey: 1,
		},
		actions: [
			{
				action: "explore",
				title: "View Details",
				icon: "/icons/checkmark.png",
			},
			{
				action: "close",
				title: "Close",
				icon: "/icons/xmark.png",
			},
		],
	};

	event.waitUntil(
		self.registration.showNotification("Lending OS Inspector", options),
	);
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
	console.log("Notification clicked:", event);

	event.notification.close();

	if (event.action === "explore") {
		event.waitUntil(clients.openWindow("/inspector"));
	}
});
