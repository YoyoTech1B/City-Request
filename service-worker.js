"use strict";

/* =========================================
   CITY QUEST SERVICE WORKER
========================================= */

const CACHE_NAME = "city-quest-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./favicon.png"
];


/* =========================================
   INSTALL
========================================= */

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(
                    cache =>
                        cache.addAll(
                            FILES_TO_CACHE
                        )
                )

        );

        self.skipWaiting();

    }
);


/* =========================================
   ACTIVATE
========================================= */

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches.keys()
                .then(
                    cacheNames =>

                        Promise.all(

                            cacheNames
                                .filter(
                                    name =>
                                        name !==
                                        CACHE_NAME
                                )
                                .map(
                                    name =>
                                        caches.delete(
                                            name
                                        )
                                )

                        )

                )

        );

        self.clients.claim();

    }
);


/* =========================================
   FETCH
========================================= */

self.addEventListener(
    "fetch",
    event => {

        if (
            event.request.method !==
            "GET"
        ) {
            return;
        }


        event.respondWith(

            caches.match(
                event.request
            )
            .then(
                cachedResponse => {

                    if (
                        cachedResponse
                    ) {

                        return cachedResponse;

                    }


                    return fetch(
                        event.request
                    )
                    .then(
                        networkResponse => {

                            if (
                                !networkResponse ||
                                networkResponse.status !== 200 ||
                                networkResponse.type ===
                                "opaque"
                            ) {

                                return networkResponse;

                            }


                            const copy =
                                networkResponse.clone();


                            caches
                                .open(
                                    CACHE_NAME
                                )
                                .then(
                                    cache => {

                                        cache.put(
                                            event.request,
                                            copy
                                        );

                                    }
                                );


                            return networkResponse;

                        }
                    )
                    .catch(
                        () =>
                            caches.match(
                                "./index.html"
                            )
                    );

                }
            )

        );

    }
);
