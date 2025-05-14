-- Script thêm lịch chiếu cho phim ID 8
-- Bước 1: Kiểm tra xem phim ID 8 có tồn tại không
SELECT * FROM movies WHERE movie_id = 8;

-- Bước 2: Thêm lịch chiếu (schedules) cho phim ID 8 cho ngày hôm nay và ngày mai
INSERT INTO schedules (schedule_id, movie_id, schedule_date, schedule_time_start, is_deleted)
VALUES 
  (nextval('sequence_schedule'), 8, CURRENT_DATE, '10:00:00', false),
  (nextval('sequence_schedule'), 8, CURRENT_DATE, '13:30:00', false),
  (nextval('sequence_schedule'), 8, CURRENT_DATE, '17:00:00', false),
  (nextval('sequence_schedule'), 8, CURRENT_DATE + INTERVAL '1 day', '10:00:00', false),
  (nextval('sequence_schedule'), 8, CURRENT_DATE + INTERVAL '1 day', '13:30:00', false),
  (nextval('sequence_schedule'), 8, CURRENT_DATE + INTERVAL '1 day', '17:00:00', false);

-- Bước 3: Thêm showtimes (liên kết giữa schedule và room)
-- Lấy ID của các schedules vừa thêm
WITH new_schedules AS (
  SELECT schedule_id 
  FROM schedules 
  WHERE movie_id = 8 
  AND schedule_date >= CURRENT_DATE
  ORDER BY schedule_date, schedule_time_start
)
INSERT INTO showtimes (schedule_id, room_id, format, is_deleted)
SELECT 
  s.schedule_id,
  r.room_id,
  CASE WHEN r.room_type = '2D' THEN '2D' ELSE '3D' END as format,
  false
FROM new_schedules s
CROSS JOIN (SELECT room_id FROM rooms WHERE room_id IN (1, 3) LIMIT 2) r;

-- Bước 4: Thêm showtime_seats cho mỗi showtimes
-- Lấy ID của các showtimes vừa thêm
WITH new_showtimes AS (
  SELECT st.schedule_id, st.room_id
  FROM showtimes st
  JOIN schedules s ON st.schedule_id = s.schedule_id
  WHERE s.movie_id = 8
  AND s.schedule_date >= CURRENT_DATE
)
INSERT INTO showtime_seats (showtime_seat_id, schedule_id, seat_id, status, price)
SELECT 
  nextval('sequence_showtime_seat'),
  st.schedule_id,
  s.seat_id,
  'AVAILABLE',
  CASE 
    WHEN s.type = 'VIP' THEN 120000 + COALESCE(s.price, 0)
    ELSE 100000 + COALESCE(s.price, 0)
  END
FROM new_showtimes st
JOIN seats s ON st.room_id = s.room_id;

-- Xác nhận dữ liệu đã được thêm
SELECT s.schedule_id, s.schedule_date, s.schedule_time_start, st.room_id, r.name as room_name, m.movie_name
FROM schedules s
JOIN showtimes st ON s.schedule_id = st.schedule_id
JOIN movies m ON s.movie_id = m.movie_id
JOIN rooms r ON st.room_id = r.room_id
WHERE s.movie_id = 8
AND s.schedule_date >= CURRENT_DATE
ORDER BY s.schedule_date, s.schedule_time_start; 