-- Thêm dữ liệu phim
INSERT INTO movies (movie_id, movie_name, summary, description_long, duration, release_date, movie_status, image_small, age_limit, director, language, trailer)
VALUES 
(1, 'Avengers: Endgame', 'Phim về siêu anh hùng', 'Sau các sự kiện tàn khốc của Avengers: Infinity War, vũ trụ đang trong tình trạng hoang tàn. Với sự giúp đỡ của các đồng minh còn lại, các Avengers tập hợp một lần nữa để đảo ngược hành động của Thanos và khôi phục sự cân bằng cho vũ trụ.', 181, '2023-05-10', 'ACTIVE', 'https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg', 13, 'Anthony Russo, Joe Russo', 'Tiếng Anh', 'https://www.youtube.com/watch?v=TcMBFSGVi1c');

-- Tạm thời comment lại những phần dữ liệu khác để đảm bảo system có thể khởi động
/*
INSERT INTO movies (movie_id, movie_name, summary, description_long, duration, release_date, movie_status, image_small, age_limit, director, language, trailer)
VALUES 
(2, 'Joker', 'Phim về kẻ xấu', 'Trong Gotham City, diễn viên hài thất bại Arthur Fleck chạm trán với phần tử tội phạm bạo lực trong thành phố. Bị xa lánh bởi xã hội, Fleck bắt đầu hành trình xuống dốc biến anh ta thành nhân vật tội phạm biểu tượng Joker.', 122, '2023-05-15', 'ACTIVE', 'https://m.media-amazon.com/images/M/MV5BNGVjNWI4ZGUtNzE0MS00YTJmLWE0ZDctN2ZiYTk2YmI3NTYyXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg', 18, 'Todd Phillips', 'Tiếng Anh', 'https://www.youtube.com/watch?v=zAGVQLHvwOY');

INSERT INTO movies (movie_id, movie_name, summary, description_long, duration, release_date, movie_status, image_small, age_limit, director, language, trailer)
VALUES 
(3, 'Fast & Furious X', 'Phim đua xe', 'Dom Toretto và gia đình của anh ta bị một kẻ thù mới đầy thù hận tìm kiếm, người muốn trả thù vì cái chết của anh trai mình.', 141, '2023-06-01', 'UPCOMING', 'https://m.media-amazon.com/images/M/MV5BNzZmOTU1ZTEtYzVhNi00NzQxLWI5ZjAtNWNhNjEwY2E3YmZjXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_.jpg', 16, 'Louis Leterrier', 'Tiếng Anh', 'https://www.youtube.com/watch?v=32RAq6JzY-w');
*/

-- Thêm dữ liệu rạp chiếu
INSERT INTO cinemas (cinema_id, name, address, status, phone, email, website) 
VALUES (1, 'CGV Vincom Thảo Điền', 'Vincom Mega Mall Thảo Điền, 161 Xa Lộ Hà Nội, P.Thảo Điền, Quận 2, TP. Hồ Chí Minh', 'ACTIVE', '1900 6017', 'cgv@example.com', 'www.cgv.vn');

INSERT INTO cinemas (cinema_id, name, address, status, phone, email, website) 
VALUES (2, 'CGV Landmark 81', 'Tầng B1, TTTM Landmark 81, 720A Điện Biên Phủ, P.22, Q. Bình Thạnh, TP. Hồ Chí Minh', 'ACTIVE', '1900 6017', 'cgv@example.com', 'www.cgv.vn');

-- Thêm dữ liệu chi nhánh rạp
INSERT INTO branches (branch_id, name, address, cinema_id, status)
VALUES (1, 'CGV Vincom Thảo Điền', 'Vincom Mega Mall Thảo Điền, 161 Xa Lộ Hà Nội, P.Thảo Điền, Quận 2, TP. Hồ Chí Minh', 1, 'ACTIVE');

INSERT INTO branches (branch_id, name, address, cinema_id, status)
VALUES (2, 'CGV Landmark 81', 'Tầng B1, TTTM Landmark 81, 720A Điện Biên Phủ, P.22, Q. Bình Thạnh, TP. Hồ Chí Minh', 2, 'ACTIVE');

-- Thêm dữ liệu phòng chiếu phim
INSERT INTO rooms (room_id, name, capacity, branch_id, status, room_type)
VALUES (1, 'Phòng chiếu 1', 100, 1, 'ACTIVE', '2D');

INSERT INTO rooms (room_id, name, capacity, branch_id, status, room_type)
VALUES (2, 'Phòng chiếu 2', 80, 1, 'ACTIVE', 'IMAX');

INSERT INTO rooms (room_id, name, capacity, branch_id, status, room_type)
VALUES (3, 'Phòng chiếu 1', 120, 2, 'ACTIVE', '3D');

INSERT INTO rooms (room_id, name, capacity, branch_id, status, room_type)
VALUES (4, 'Phòng chiếu 2', 90, 2, 'ACTIVE', '2D');

-- Thêm dữ liệu lịch chiếu phim
INSERT INTO schedules (schedule_id, movie_id, room_id, start_time, end_time, price, status, date)
VALUES (1, 1, 1, '10:00:00', '13:01:00', 90000, 'ACTIVE', '2023-06-10');

INSERT INTO schedules (schedule_id, movie_id, room_id, start_time, end_time, price, status, date)
VALUES (2, 1, 1, '14:00:00', '17:01:00', 100000, 'ACTIVE', '2023-06-10');

INSERT INTO schedules (schedule_id, movie_id, room_id, start_time, end_time, price, status, date)
VALUES (3, 2, 2, '10:30:00', '12:32:00', 110000, 'ACTIVE', '2023-06-10');

INSERT INTO schedules (schedule_id, movie_id, room_id, start_time, end_time, price, status, date)
VALUES (4, 2, 2, '13:30:00', '15:32:00', 120000, 'ACTIVE', '2023-06-10');

INSERT INTO schedules (schedule_id, movie_id, room_id, start_time, end_time, price, status, date)
VALUES (5, 1, 3, '11:00:00', '14:01:00', 130000, 'ACTIVE', '2023-06-10');

INSERT INTO schedules (schedule_id, movie_id, room_id, start_time, end_time, price, status, date)
VALUES (6, 2, 4, '12:00:00', '14:02:00', 95000, 'ACTIVE', '2023-06-10');

-- Thêm dữ liệu cho ngày hôm nay
INSERT INTO schedules (schedule_id, movie_id, room_id, start_time, end_time, price, status, date)
VALUES (7, 1, 1, '10:00:00', '13:01:00', 90000, 'ACTIVE', CURRENT_DATE);

INSERT INTO schedules (schedule_id, movie_id, room_id, start_time, end_time, price, status, date)
VALUES (8, 1, 1, '14:00:00', '17:01:00', 100000, 'ACTIVE', CURRENT_DATE);

INSERT INTO schedules (schedule_id, movie_id, room_id, start_time, end_time, price, status, date)
VALUES (9, 2, 2, '10:30:00', '12:32:00', 110000, 'ACTIVE', CURRENT_DATE);

INSERT INTO schedules (schedule_id, movie_id, room_id, start_time, end_time, price, status, date)
VALUES (10, 2, 2, '13:30:00', '15:32:00', 120000, 'ACTIVE', CURRENT_DATE);

-- Thêm ghế cho phòng chiếu 1
INSERT INTO seats (seat_id, room_id, row, number, status, type, price)
VALUES 
(1, 1, 'A', 1, 'ACTIVE', 'REGULAR', 0),
(2, 1, 'A', 2, 'ACTIVE', 'REGULAR', 0),
(3, 1, 'A', 3, 'ACTIVE', 'REGULAR', 0),
(4, 1, 'A', 4, 'ACTIVE', 'REGULAR', 0),
(5, 1, 'A', 5, 'ACTIVE', 'REGULAR', 0),
(6, 1, 'B', 1, 'ACTIVE', 'REGULAR', 0),
(7, 1, 'B', 2, 'ACTIVE', 'REGULAR', 0),
(8, 1, 'B', 3, 'ACTIVE', 'REGULAR', 0),
(9, 1, 'B', 4, 'ACTIVE', 'REGULAR', 0),
(10, 1, 'B', 5, 'ACTIVE', 'REGULAR', 0),
(11, 1, 'C', 1, 'ACTIVE', 'VIP', 20000),
(12, 1, 'C', 2, 'ACTIVE', 'VIP', 20000),
(13, 1, 'C', 3, 'ACTIVE', 'VIP', 20000),
(14, 1, 'C', 4, 'ACTIVE', 'VIP', 20000),
(15, 1, 'C', 5, 'ACTIVE', 'VIP', 20000);

-- Thêm ghế cho phòng chiếu 2
INSERT INTO seats (seat_id, room_id, row, number, status, type, price)
VALUES 
(16, 2, 'A', 1, 'ACTIVE', 'REGULAR', 0),
(17, 2, 'A', 2, 'ACTIVE', 'REGULAR', 0),
(18, 2, 'A', 3, 'ACTIVE', 'REGULAR', 0),
(19, 2, 'A', 4, 'ACTIVE', 'REGULAR', 0),
(20, 2, 'B', 1, 'ACTIVE', 'REGULAR', 0),
(21, 2, 'B', 2, 'ACTIVE', 'REGULAR', 0),
(22, 2, 'B', 3, 'ACTIVE', 'REGULAR', 0),
(23, 2, 'B', 4, 'ACTIVE', 'REGULAR', 0),
(24, 2, 'C', 1, 'ACTIVE', 'VIP', 25000),
(25, 2, 'C', 2, 'ACTIVE', 'VIP', 25000),
(26, 2, 'C', 3, 'ACTIVE', 'VIP', 25000),
(27, 2, 'C', 4, 'ACTIVE', 'VIP', 25000);

-- Thêm ghế suất chiếu (liên kết ghế với suất chiếu)
-- Suất chiếu 1, phòng 1
INSERT INTO showtime_seats (showtime_seat_id, schedule_id, seat_id, status, price)
SELECT 
  ROW_NUMBER() OVER () as showtime_seat_id,
  1 as schedule_id,
  seat_id as seat_id,
  'AVAILABLE' as status,
  90000 + price as price
FROM seats
WHERE room_id = 1
LIMIT 15;

-- Suất chiếu 2, phòng 1
INSERT INTO showtime_seats (showtime_seat_id, schedule_id, seat_id, status, price)
SELECT 
  ROW_NUMBER() OVER () + 15 as showtime_seat_id,
  2 as schedule_id,
  seat_id as seat_id,
  'AVAILABLE' as status,
  100000 + price as price
FROM seats
WHERE room_id = 1
LIMIT 15;

-- Suất chiếu 3, phòng 2
INSERT INTO showtime_seats (showtime_seat_id, schedule_id, seat_id, status, price)
SELECT 
  ROW_NUMBER() OVER () + 30 as showtime_seat_id,
  3 as schedule_id,
  seat_id as seat_id,
  'AVAILABLE' as status,
  110000 + price as price
FROM seats
WHERE room_id = 2
LIMIT 12;

-- Suất chiếu 4, phòng 2
INSERT INTO showtime_seats (showtime_seat_id, schedule_id, seat_id, status, price)
SELECT 
  ROW_NUMBER() OVER () + 42 as showtime_seat_id,
  4 as schedule_id,
  seat_id as seat_id,
  'AVAILABLE' as status,
  120000 + price as price
FROM seats
WHERE room_id = 2
LIMIT 12;

-- Suất chiếu cho ngày hôm nay
-- Suất chiếu 7, phòng 1
INSERT INTO showtime_seats (showtime_seat_id, schedule_id, seat_id, status, price)
SELECT 
  ROW_NUMBER() OVER () + 54 as showtime_seat_id,
  7 as schedule_id,
  seat_id as seat_id,
  'AVAILABLE' as status,
  90000 + price as price
FROM seats
WHERE room_id = 1
LIMIT 15;

-- Suất chiếu 8, phòng 1
INSERT INTO showtime_seats (showtime_seat_id, schedule_id, seat_id, status, price)
SELECT 
  ROW_NUMBER() OVER () + 69 as showtime_seat_id,
  8 as schedule_id,
  seat_id as seat_id,
  'AVAILABLE' as status,
  100000 + price as price
FROM seats
WHERE room_id = 1
LIMIT 15;

-- Suất chiếu 9, phòng 2
INSERT INTO showtime_seats (showtime_seat_id, schedule_id, seat_id, status, price)
SELECT 
  ROW_NUMBER() OVER () + 84 as showtime_seat_id,
  9 as schedule_id,
  seat_id as seat_id,
  'AVAILABLE' as status,
  110000 + price as price
FROM seats
WHERE room_id = 2
LIMIT 12;

-- Suất chiếu 10, phòng 2
INSERT INTO showtime_seats (showtime_seat_id, schedule_id, seat_id, status, price)
SELECT 
  ROW_NUMBER() OVER () + 96 as showtime_seat_id,
  10 as schedule_id,
  seat_id as seat_id,
  'AVAILABLE' as status,
  120000 + price as price
FROM seats
WHERE room_id = 2
LIMIT 12;

-- Thêm dữ liệu thức ăn và đồ uống
INSERT INTO foods (food_id, name, description, price, category, image_url, status)
VALUES 
(1, 'Bắp rang bơ (Nhỏ)', 'Hộp bắp rang bơ kích thước nhỏ', 45000, 'FOOD', 'https://cdn.pixabay.com/photo/2013/07/13/11/48/popcorn-158869_960_720.png', 'ACTIVE'),
(2, 'Bắp rang bơ (Vừa)', 'Hộp bắp rang bơ kích thước vừa', 55000, 'FOOD', 'https://cdn.pixabay.com/photo/2013/07/13/11/48/popcorn-158869_960_720.png', 'ACTIVE'),
(3, 'Bắp rang bơ (Lớn)', 'Hộp bắp rang bơ kích thước lớn', 65000, 'FOOD', 'https://cdn.pixabay.com/photo/2013/07/13/11/48/popcorn-158869_960_720.png', 'ACTIVE'),
(4, 'Coca-Cola (Nhỏ)', 'Ly nước ngọt Coca-Cola kích thước nhỏ', 25000, 'DRINK', 'https://cdn.pixabay.com/photo/2014/09/26/19/51/coca-cola-462776_960_720.jpg', 'ACTIVE'),
(5, 'Coca-Cola (Vừa)', 'Ly nước ngọt Coca-Cola kích thước vừa', 35000, 'DRINK', 'https://cdn.pixabay.com/photo/2014/09/26/19/51/coca-cola-462776_960_720.jpg', 'ACTIVE'),
(6, 'Coca-Cola (Lớn)', 'Ly nước ngọt Coca-Cola kích thước lớn', 45000, 'DRINK', 'https://cdn.pixabay.com/photo/2014/09/26/19/51/coca-cola-462776_960_720.jpg', 'ACTIVE'),
(7, 'Combo Bắp + Nước', 'Bắp rang bơ (Vừa) + Coca-Cola (Vừa)', 80000, 'COMBO', 'https://cdn.pixabay.com/photo/2017/09/28/18/13/bread-2796393_960_720.jpg', 'ACTIVE'),
(8, 'Combo Đôi', '2 Bắp rang bơ (Vừa) + 2 Coca-Cola (Vừa)', 150000, 'COMBO', 'https://cdn.pixabay.com/photo/2017/09/28/18/13/bread-2796393_960_720.jpg', 'ACTIVE'),
(9, 'Combo Gia đình', '2 Bắp rang bơ (Lớn) + 4 Coca-Cola (Vừa)', 250000, 'COMBO', 'https://cdn.pixabay.com/photo/2017/09/28/18/13/bread-2796393_960_720.jpg', 'ACTIVE'); 