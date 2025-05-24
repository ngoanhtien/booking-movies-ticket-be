package com.booking.movieticket.service.impl;

import com.booking.movieticket.service.CacheSeatService;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class CacheSeatServiceImpl implements CacheSeatService {
    private final static Cache<String, Map<String, Object>> cache = CacheBuilder.newBuilder()
            .initialCapacity(10)
            .concurrencyLevel(12)
            .expireAfterWrite(100, TimeUnit.MINUTES)
            .build();

    @Override
    public void put(String key, Map<String, Object> value) {
        cache.put(key, value);
    }

    @Override
    public void remove(String key) {
        cache.invalidate(key);
    }

    @Override
    public Map<String, Object> get(String key) {
        return cache.getIfPresent(key);
    }

    @Override
    public void clearAll() {
        cache.invalidateAll();
    }
}
