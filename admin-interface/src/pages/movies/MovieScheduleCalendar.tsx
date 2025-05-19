import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Container, FormControl, InputLabel, Select, MenuItem, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, SelectChangeEvent } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useTranslation } from 'react-i18next';
import moment from 'moment-timezone';

// Define interfaces for our data types
interface Movie {
  id: number;
  title: string;
  duration: number; // in minutes
  posterUrl: string;
}

interface Cinema {
  id: number;
  name: string;
}

interface Room {
  id: number;
  name: string;
  cinemaId: number;
  capacity: number;
}

interface ScheduleEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  movieId: number;
  cinemaId: number;
  roomId: number;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps?: {
    movie?: Movie;
    room?: Room;
    price?: number;
  };
}

const MovieScheduleCalendar: React.FC = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [selectedCinema, setSelectedCinema] = useState<string>('');
  const [selectedMovie, setSelectedMovie] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [timeZone, setTimeZone] = useState('Asia/Ho_Chi_Minh');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<ScheduleEvent | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [price, setPrice] = useState<number>(0);

  // Mock data initialization
  useEffect(() => {
    // Mock movies data
    const mockMovies: Movie[] = [
      { id: 1, title: 'Avengers: Endgame', duration: 180, posterUrl: 'https://example.com/endgame.jpg' },
      { id: 2, title: 'Spider-Man: No Way Home', duration: 150, posterUrl: 'https://example.com/spiderman.jpg' },
      { id: 3, title: 'Black Widow', duration: 134, posterUrl: 'https://example.com/blackwidow.jpg' },
      { id: 4, title: 'Shang-Chi', duration: 132, posterUrl: 'https://example.com/shangchi.jpg' },
      { id: 5, title: 'Doctor Strange', duration: 126, posterUrl: 'https://example.com/drstrange.jpg' },
    ];
    
    // Mock cinemas data
    const mockCinemas: Cinema[] = [
      { id: 1, name: 'CGV Saigon Centre' },
      { id: 2, name: 'CGV Vincom Đồng Khởi' },
      { id: 3, name: 'CGV Aeon Tân Phú' },
    ];
    
    // Mock rooms data
    const mockRooms: Room[] = [
      { id: 1, name: 'Room 1 - IMAX', cinemaId: 1, capacity: 120 },
      { id: 2, name: 'Room 2 - 3D', cinemaId: 1, capacity: 100 },
      { id: 3, name: 'Room 3 - 2D', cinemaId: 1, capacity: 80 },
      { id: 4, name: 'Room 1 - Screenx', cinemaId: 2, capacity: 110 },
      { id: 5, name: 'Room 2 - 3D', cinemaId: 2, capacity: 90 },
      { id: 6, name: 'Room 1 - 4DX', cinemaId: 3, capacity: 100 },
      { id: 7, name: 'Room 2 - 2D', cinemaId: 3, capacity: 85 },
    ];
    
    // Mock schedule events
    const mockEvents: ScheduleEvent[] = [
      {
        id: '1',
        title: 'Avengers: Endgame - Room 1',
        start: '2023-07-20T10:00:00',
        end: '2023-07-20T13:00:00',
        movieId: 1,
        cinemaId: 1,
        roomId: 1,
        backgroundColor: '#3788d8',
        borderColor: '#2C6FC9',
        extendedProps: {
          movie: mockMovies[0],
          room: mockRooms[0],
          price: 120000
        }
      },
      {
        id: '2',
        title: 'Spider-Man: No Way Home - Room 2',
        start: '2023-07-20T14:00:00',
        end: '2023-07-20T16:30:00',
        movieId: 2,
        cinemaId: 1,
        roomId: 2,
        backgroundColor: '#38B000',
        borderColor: '#2D8B00',
        extendedProps: {
          movie: mockMovies[1],
          room: mockRooms[1],
          price: 100000
        }
      },
      {
        id: '3',
        title: 'Black Widow - Room 4',
        start: '2023-07-21T11:00:00',
        end: '2023-07-21T13:15:00',
        movieId: 3,
        cinemaId: 2,
        roomId: 4,
        backgroundColor: '#FF4D6D',
        borderColor: '#C53B54',
        extendedProps: {
          movie: mockMovies[2],
          room: mockRooms[3],
          price: 110000
        }
      },
      {
        id: '4',
        title: 'Shang-Chi - Room 6',
        start: '2023-07-22T10:00:00',
        end: '2023-07-22T12:15:00',
        movieId: 4,
        cinemaId: 3,
        roomId: 6,
        backgroundColor: '#9D4EDD',
        borderColor: '#7B3EB0',
        extendedProps: {
          movie: mockMovies[3],
          room: mockRooms[5],
          price: 130000
        }
      },
    ];
    
    setMovies(mockMovies);
    setCinemas(mockCinemas);
    setRooms(mockRooms);
    setEvents(mockEvents);
  }, []);

  // Filter rooms based on selected cinema
  useEffect(() => {
    if (selectedCinema) {
      const cinemaId = Number(selectedCinema);
      const filtered = rooms.filter(room => room.cinemaId === cinemaId);
      setFilteredRooms(filtered);
    } else {
      setFilteredRooms([]);
    }
    setSelectedRoom('');
  }, [selectedCinema, rooms]);

  // Handle cinema selection
  const handleCinemaChange = (event: SelectChangeEvent) => {
    setSelectedCinema(event.target.value);
  };

  // Handle movie selection
  const handleMovieChange = (event: SelectChangeEvent) => {
    setSelectedMovie(event.target.value);
  };

  // Handle room selection
  const handleRoomChange = (event: SelectChangeEvent) => {
    setSelectedRoom(event.target.value);
  };

  // Handle date selection
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  // Handle timezone selection
  const handleTimezoneChange = (event: SelectChangeEvent) => {
    setTimeZone(event.target.value);
  };

  // Handle clicking on a date to add a new event
  const handleDateClick = (arg: any) => {
    // Only open dialog if cinema, movie, and room are selected
    if (selectedCinema && selectedMovie && selectedRoom) {
      const clickedDate = moment(arg.date).format('YYYY-MM-DD');
      setSelectedDate(clickedDate);
      
      // Default times: current time rounded to nearest half hour for start, and movie duration added for end
      const selectedMovieObj = movies.find(m => m.id === Number(selectedMovie));
      
      if (selectedMovieObj) {
        const now = moment(arg.date);
        // Round to nearest half hour
        const minutes = Math.ceil(now.minutes() / 30) * 30;
        now.minutes(minutes % 60);
        now.hours(now.hours() + Math.floor(minutes / 60));
        
        const startTimeStr = now.format('HH:mm');
        const endTimeStr = now.add(selectedMovieObj.duration, 'minutes').format('HH:mm');
        
        setStartTime(startTimeStr);
        setEndTime(endTimeStr);
        
        setCurrentEvent({
          id: `new-${Date.now()}`,
          title: `${selectedMovieObj.title}`,
          start: `${clickedDate}T${startTimeStr}:00`,
          end: `${clickedDate}T${endTimeStr}:00`,
          movieId: Number(selectedMovie),
          cinemaId: Number(selectedCinema),
          roomId: Number(selectedRoom),
          backgroundColor: getRandomColor(),
          borderColor: getRandomColor(true)
        });
        
        setDialogOpen(true);
      }
    } else {
      alert(t('schedule.selectCinemaMovieRoom'));
    }
  };

  // Handle clicking on an existing event to edit
  const handleEventClick = (arg: any) => {
    const eventData = arg.event;
    const movieId = eventData.extendedProps.movieId || eventData._def.extendedProps.movieId;
    const cinemaId = eventData.extendedProps.cinemaId || eventData._def.extendedProps.cinemaId;
    const roomId = eventData.extendedProps.roomId || eventData._def.extendedProps.roomId;
    const eventPrice = eventData.extendedProps.price || 0;
    
    // Extract date, start time, and end time
    const startDateTime = moment(eventData.start);
    const endDateTime = moment(eventData.end);
    
    setSelectedDate(startDateTime.format('YYYY-MM-DD'));
    setStartTime(startDateTime.format('HH:mm'));
    setEndTime(endDateTime.format('HH:mm'));
    setSelectedMovie(movieId.toString());
    setSelectedCinema(cinemaId.toString());
    setSelectedRoom(roomId.toString());
    setPrice(eventPrice);
    
    setCurrentEvent({
      id: eventData.id,
      title: eventData.title,
      start: eventData.startStr,
      end: eventData.endStr,
      movieId: movieId,
      cinemaId: cinemaId,
      roomId: roomId,
      backgroundColor: eventData.backgroundColor,
      borderColor: eventData.borderColor,
      extendedProps: {
        price: eventPrice
      }
    });
    
    setDialogOpen(true);
  };

  // Handle saving the event (add or edit)
  const handleSaveEvent = () => {
    if (!currentEvent || !selectedMovie || !selectedCinema || !selectedRoom || !selectedDate || !startTime || !endTime) {
      alert(t('schedule.fillAllFields'));
      return;
    }

    const movieObj = movies.find(m => m.id === Number(selectedMovie));
    const roomObj = rooms.find(r => r.id === Number(selectedRoom));
    
    if (!movieObj || !roomObj) {
      alert(t('schedule.selectionError'));
      return;
    }

    const startDateTime = `${selectedDate}T${startTime}:00`;
    const endDateTime = `${selectedDate}T${endTime}:00`;
    
    const updatedEvent: ScheduleEvent = {
      ...currentEvent,
      title: `${movieObj.title} - ${roomObj.name}`,
      start: startDateTime,
      end: endDateTime,
      movieId: Number(selectedMovie),
      cinemaId: Number(selectedCinema),
      roomId: Number(selectedRoom),
      extendedProps: {
        movie: movieObj,
        room: roomObj,
        price: price
      }
    };
    
    // Check for existing event with ID, update if found, otherwise add new
    const eventExists = events.some(e => e.id === updatedEvent.id);
    
    if (eventExists) {
      setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    } else {
      setEvents([...events, updatedEvent]);
    }
    
    setDialogOpen(false);
    resetForm();
  };

  // Handle deleting an event
  const handleDeleteEvent = () => {
    if (currentEvent) {
      setEvents(events.filter(e => e.id !== currentEvent.id));
      setDialogOpen(false);
      resetForm();
    }
  };

  // Reset form values
  const resetForm = () => {
    setCurrentEvent(null);
    setStartTime('');
    setEndTime('');
    setPrice(0);
  };

  // Generate random color for events
  const getRandomColor = (darker = false) => {
    const colors = [
      '#3788d8', '#38B000', '#FF4D6D', '#9D4EDD', '#F9C74F', 
      '#F08700', '#4CC9F0', '#F72585', '#4361EE', '#7209B7'
    ];
    const darkerColors = [
      '#2C6FC9', '#2D8B00', '#C53B54', '#7B3EB0', '#C6A03F', 
      '#BF6B00', '#3CA0C0', '#C51D6A', '#3651BE', '#5B0793'
    ];
    
    const randomIndex = Math.floor(Math.random() * colors.length);
    return darker ? darkerColors[randomIndex] : colors[randomIndex];
  };

  return (
    <Container>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>{t('schedule.movieScheduleManagement')}</Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="cinema-select-label">{t('schedule.cinema')}</InputLabel>
              <Select
                labelId="cinema-select-label"
                value={selectedCinema}
                onChange={handleCinemaChange}
                label={t('schedule.cinema')}
              >
                {cinemas.map(cinema => (
                  <MenuItem key={cinema.id} value={cinema.id.toString()}>{cinema.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="movie-select-label">{t('schedule.movie')}</InputLabel>
              <Select
                labelId="movie-select-label"
                value={selectedMovie}
                onChange={handleMovieChange}
                label={t('schedule.movie')}
              >
                {movies.map(movie => (
                  <MenuItem key={movie.id} value={movie.id.toString()}>{movie.title} ({movie.duration} {t('schedule.minutes')})</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="room-select-label">{t('schedule.room')}</InputLabel>
              <Select
                labelId="room-select-label"
                value={selectedRoom}
                onChange={handleRoomChange}
                label={t('schedule.room')}
                disabled={!selectedCinema}
              >
                {filteredRooms.map(room => (
                  <MenuItem key={room.id} value={room.id.toString()}>{room.name} ({room.capacity} {t('schedule.seats')})</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="timezone-select-label">{t('schedule.timezone')}</InputLabel>
              <Select
                labelId="timezone-select-label"
                value={timeZone}
                onChange={handleTimezoneChange}
                label={t('schedule.timezone')}
              >
                <MenuItem value="Asia/Ho_Chi_Minh">Vietnam (GMT+7)</MenuItem>
                <MenuItem value="Asia/Bangkok">Bangkok (GMT+7)</MenuItem>
                <MenuItem value="Asia/Singapore">Singapore (GMT+8)</MenuItem>
                <MenuItem value="Asia/Tokyo">Tokyo (GMT+9)</MenuItem>
                <MenuItem value="Europe/London">London (GMT+0/+1)</MenuItem>
                <MenuItem value="America/New_York">New York (GMT-5/-4)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Box sx={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            timeZone={timeZone}
            events={events}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            allDaySlot={false}
            slotMinTime="08:00:00"
            slotMaxTime="24:00:00"
            slotDuration="00:30:00"
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false,
              hour12: false
            }}
          />
        </Box>
      </Paper>
      
      {/* Add/Edit Event Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentEvent && currentEvent.id.startsWith('new-') 
            ? t('schedule.addSchedule') 
            : t('schedule.editSchedule')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="dialog-movie-label">{t('schedule.movie')}</InputLabel>
                <Select
                  labelId="dialog-movie-label"
                  value={selectedMovie}
                  onChange={handleMovieChange}
                  label={t('schedule.movie')}
                >
                  {movies.map(movie => (
                    <MenuItem key={movie.id} value={movie.id.toString()}>{movie.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="dialog-cinema-label">{t('schedule.cinema')}</InputLabel>
                <Select
                  labelId="dialog-cinema-label"
                  value={selectedCinema}
                  onChange={handleCinemaChange}
                  label={t('schedule.cinema')}
                >
                  {cinemas.map(cinema => (
                    <MenuItem key={cinema.id} value={cinema.id.toString()}>{cinema.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="dialog-room-label">{t('schedule.room')}</InputLabel>
                <Select
                  labelId="dialog-room-label"
                  value={selectedRoom}
                  onChange={handleRoomChange}
                  label={t('schedule.room')}
                  disabled={!selectedCinema}
                >
                  {filteredRooms.map(room => (
                    <MenuItem key={room.id} value={room.id.toString()}>{room.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('schedule.date')}
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('schedule.startTime')}
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('schedule.endTime')}
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('schedule.price')}
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                InputProps={{ endAdornment: <Typography variant="body2">VND</Typography> }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          {!currentEvent?.id.startsWith('new-') && (
            <Button onClick={handleDeleteEvent} color="error">
              {t('schedule.delete')}
            </Button>
          )}
          <Button onClick={() => setDialogOpen(false)}>
            {t('schedule.cancel')}
          </Button>
          <Button onClick={handleSaveEvent} color="primary">
            {t('schedule.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MovieScheduleCalendar; 