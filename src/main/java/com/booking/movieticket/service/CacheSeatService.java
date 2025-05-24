package com.booking.movieticket.service;

import java.util.Map;

public interface CacheSeatService {
    void put(String key, Map<String, Object> value);

    void remove(String key);

    Map<String, Object> get(String key);

    void clearAll();
}
