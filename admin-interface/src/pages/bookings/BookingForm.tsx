import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  TextField,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
// import { Movie } from '../../types/movie'; // Assuming you have a movie type
// import { Showtime } from '../../types/showtime'; // Assuming you have a showtime type
// import { Seat } from '../../types/seat'; // Assuming you have a seat type

// Let's define a simple Showtime type for now
interface Showtime {
  id: string;
  time: string;
  roomName: string;
  availableSeats: number;
}

// Define SeatStatus enum and Seat interface
export enum SeatStatus {
  Available = 'available',
  Booked = 'booked',
  Selected = 'selected',
  Unavailable = 'unavailable', // e.g., aisle, space
}

export interface Seat {
  id: string; // e.g., "A1", "B5"
  row: string;
  number: number;
  status: SeatStatus;
  price?: number; // Optional: if seats have different prices
}

// Define FoodItem and FoodSelection interfaces
export interface FoodItem {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl?: string; // Optional image
}

export interface FoodSelection {
  itemId: string;
  quantity: number;
}

const steps = ['Select Showtime', 'Select Seats', 'Add Food & Drinks', 'Confirm & Pay'];

interface BookingFormProps {
  movieId?: string; // Movie ID might be passed if navigating from a movie details page
}

const BookingForm: React.FC<BookingFormProps> = ({ movieId }) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data - replace with API calls
  // const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  // const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null); // We'll use formik for selectedShowtimeId
  const [seatLayout, setSeatLayout] = useState<Seat[][]>([]); 
  const [availableFoodItems, setAvailableFoodItems] = useState<FoodItem[]>([]);

  const validationSchema = Yup.object().shape({
    // Define Yup validation based on activeStep
    showtimeId: activeStep === 0 ? Yup.string().required('Showtime is required') : Yup.string(),
    seatIds: activeStep === 1 ? Yup.array().min(1, 'Please select at least one seat.').required('Please select at least one seat.') : Yup.array(),
    foodItems: activeStep === 2 ? Yup.array().min(1, 'Please select at least one food item.').required('Please select at least one food item.') : Yup.array(),
  });

  const formik = useFormik<{
    showtimeId: string;
    seatIds: string[]; // Explicitly type seatIds
    foodItems: FoodSelection[]; // Updated to FoodSelection[]
    paymentMethod: string;
  }> ({
    initialValues: {
      showtimeId: '',
      seatIds: [],
      foodItems: [],
      paymentMethod: 'creditCard',
      // ... other fields
    },
    validationSchema,
    onSubmit: (values) => {
      setLoading(true);
      setError(null);
      console.log('Booking Submitted', values);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        // On success:
        // setActiveStep((prevActiveStep) => prevActiveStep + 1);
        // Or show success message
        // On error:
        // setError('Booking failed. Please try again.');
      }, 2000);
    },
  });

  const handleNext = () => {
    // Trigger validation for the current step before proceeding
    if (activeStep === 0) {
      formik.validateField('showtimeId').then(fieldError => {
        if (!fieldError) { // if fieldError is undefined, validation passed
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
        } else {
          formik.setFieldTouched('showtimeId', true, true); // Show validation error and run validation
        }
      });
    } else if (activeStep === 1) {
      formik.validateField('seatIds').then(fieldError => {
        if (!fieldError) {
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
        } else {
          formik.setFieldTouched('seatIds', true, true);
        }
      });
    } else if (activeStep === 2) {
      // For now, no specific validation for food items before proceeding
      // Add formik.validateField('foodItems') if specific rules are needed
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } else {
      // For other steps, you might have different validation or just proceed
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Fetch movie details and showtimes if movieId is provided
  useEffect(() => {
    if (movieId) {
      // setLoading(true);
      // Fetch movie details
      // Fetch showtimes for this movie
      // For now, setting mock showtimes
      const mockShowtimes: Showtime[] = [
        { id: 'st1', time: '10:00 AM', roomName: 'Room 1', availableSeats: 50 },
        { id: 'st2', time: '01:00 PM', roomName: 'Room 2', availableSeats: 30 },
        { id: 'st3', time: '04:00 PM', roomName: 'Room 1', availableSeats: 10 },
        { id: 'st4', time: '07:00 PM', roomName: 'Screen X', availableSeats: 75 },
      ];
      setShowtimes(mockShowtimes);
      // setLoading(false);
    } else {
      // If no movieId, maybe fetch all upcoming showtimes or show a message
       const genericMockShowtimes: Showtime[] = [
        { id: 'gst1', time: '11:00 AM', roomName: 'Any Room A', availableSeats: 20 },
        { id: 'gst2', time: '02:30 PM', roomName: 'Any Room B', availableSeats: 40 },
      ];
      setShowtimes(genericMockShowtimes);
    }
  }, [movieId]);

  // Generate mock seat layout when showtimeId changes and we are on the seat selection step
  useEffect(() => {
    if (formik.values.showtimeId && activeStep === 1) { 
      console.log('Generating/Fetching seat layout for showtime:', formik.values.showtimeId);
      setLoading(true);
      const generateMockLayout = (): Seat[][] => {
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const seatsPerRow = 12;
        const layout: Seat[][] = [];
        for (let i = 0; i < rows.length; i++) {
          const rowSeats: Seat[] = [];
          for (let j = 1; j <= seatsPerRow; j++) {
            const seatId = `${rows[i]}${j}`;
            let status = SeatStatus.Available;
            // Randomly make some seats booked
            if (Math.random() < 0.2) status = SeatStatus.Booked;
            // Make some seats unavailable (aisles etc)
            if (j === 3 || j === seatsPerRow - 2) status = SeatStatus.Unavailable; 
            
            rowSeats.push({
              id: seatId,
              row: rows[i],
              number: j,
              status: status,
              price: status === SeatStatus.Booked || status === SeatStatus.Unavailable ? undefined : 100, // Example price
            });
          }
          layout.push(rowSeats);
        }
        return layout;
      };
      // Simulate API delay
      setTimeout(() => {
        setSeatLayout(generateMockLayout());
        // Clear previously selected seats when layout changes for a new showtime
        formik.setFieldValue('seatIds', []); 
        setLoading(false);
      }, 500);
    } else if (activeStep !== 1) {
      // If we navigate away from seat selection, clear the layout (optional, good for cleanup)
      // setSeatLayout([]); 
    }
  }, [formik.values.showtimeId, activeStep]); // Re-run if showtimeId or activeStep changes

  // Effect to load food/drink items when entering step 2
  useEffect(() => {
    if (activeStep === 2) {
      setLoading(true);
      // Simulate API call to fetch food items
      const mockFoodItems: FoodItem[] = [
        { id: 'food1', name: 'Popcorn Large', price: 5.99, category: 'Snacks', imageUrl: 'https://via.placeholder.com/50/FFA500/000000?Text=Popcorn' },
        { id: 'food2', name: 'Nachos', price: 6.49, category: 'Snacks', imageUrl: 'https://via.placeholder.com/50/FFC107/000000?Text=Nachos' },
        { id: 'drink1', name: 'Cola Large', price: 3.99, category: 'Drinks', imageUrl: 'https://via.placeholder.com/50/F44336/FFFFFF?Text=Cola' },
        { id: 'drink2', name: 'Water Bottle', price: 2.00, category: 'Drinks', imageUrl: 'https://via.placeholder.com/50/2196F3/FFFFFF?Text=Water' },
        { id: 'combo1', name: 'Popcorn + Cola Combo', price: 8.99, category: 'Combos', imageUrl: 'https://via.placeholder.com/50/4CAF50/FFFFFF?Text=Combo' },
      ];
      setTimeout(() => {
        setAvailableFoodItems(mockFoodItems);
        setLoading(false);
      }, 500);
    }
  }, [activeStep]);

  // Helper function to find selected showtime details
  const getSelectedShowtimeDetails = () => {
    if (!formik.values.showtimeId || showtimes.length === 0) return null;
    return showtimes.find(st => st.id === formik.values.showtimeId);
  };

  // Helper function to get details of selected food items
  const getSelectedFoodItemsDetails = () => {
    if (formik.values.foodItems.length === 0 || availableFoodItems.length === 0) return [];
    return formik.values.foodItems.map(selection => {
      const itemDetails = availableFoodItems.find(food => food.id === selection.itemId);
      return {
        ...itemDetails,
        quantity: selection.quantity,
        subtotal: itemDetails ? itemDetails.price * selection.quantity : 0,
      };
    }).filter(item => item.id); // Filter out if any itemDetails were not found (should not happen with mock data)
  };
  
  // Calculate total price
  const calculateTotalPrice = () => {
    let total = 0;
    // Add price for seats (assuming each selected seat has a price, e.g. from seatLayout or a fixed price)
    // For simplicity, let's assume a fixed price per seat for now if not on seat object
    const seatPrice = seatLayout[0]?.[0]?.price || 10; // Fallback, ideally get from selected seats
    total += formik.values.seatIds.length * seatPrice;

    getSelectedFoodItemsDetails().forEach(item => {
      total += item.subtotal || 0;
    });
    return total;
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>{t('booking.selectShowtime', 'Select Showtime')}</Typography>
            {showtimes.length === 0 && !loading && (
              <Typography sx={{my: 2}}>{t('booking.noShowtimes', 'No showtimes available for this movie or selection.')}</Typography>
            )}
            {showtimes.length > 0 && (
              <FormControl component="fieldset" error={formik.touched.showtimeId && Boolean(formik.errors.showtimeId)} fullWidth>
                <InputLabel id="showtime-select-label" shrink={!!formik.values.showtimeId} sx={{position: 'static', transform: 'none', mb:1}}>
                  {t('booking.availableShowtimes', 'Available Showtimes')}
                </InputLabel>
                <RadioGroup
                  aria-label="showtime"
                  name="showtimeId"
                  value={formik.values.showtimeId}
                  onChange={(event) => {
                    formik.setFieldValue('showtimeId', event.target.value);
                  }}
                >
                  <List>
                    {showtimes.map((showtime) => (
                      <React.Fragment key={showtime.id}>
                        <ListItem 
                          button 
                          onClick={() => formik.setFieldValue('showtimeId', showtime.id)}
                          selected={formik.values.showtimeId === showtime.id}
                          sx={{ 
                            borderRadius: 1, 
                            mb: 1, 
                            border: '1px solid', 
                            borderColor: formik.values.showtimeId === showtime.id ? 'primary.main' : 'divider',
                            '&:hover': {
                              borderColor: 'primary.light',
                            }
                          }}
                        >
                          <Radio value={showtime.id} sx={{mr: 1}} checked={formik.values.showtimeId === showtime.id} />
                          <ListItemText 
                            primary={`${showtime.time} - ${showtime.roomName}`} 
                            secondary={t('booking.seatsAvailable', '{{count}} seats available', { count: showtime.availableSeats })} 
                          />
                        </ListItem>
                        <Divider sx={{mb: 1, display: showtimes.indexOf(showtime) === showtimes.length -1 ? 'none' : 'block' }}/>
                      </React.Fragment>
                    ))}
                  </List>
                </RadioGroup>
                {formik.touched.showtimeId && formik.errors.showtimeId && (
                  <Typography color="error" variant="caption">{formik.errors.showtimeId}</Typography>
                )}
              </FormControl>
            )}
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>{t('booking.selectSeats', 'Select Seats')}</Typography>
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
            {!loading && seatLayout.length === 0 && (
                <Typography sx={{my: 2}}>{t('booking.noSeatLayout', 'Seat layout not available. Please select a showtime first.')}</Typography>
            )}
            {/* Seat map UI here - to be implemented in next step */}
             {seatLayout.map((row, rowIndex) => (
              <Box key={`row-${rowIndex}`} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 0.5 }}>
                <Typography sx={{width: '20px', textAlign:'center', mr: 1, fontSize: '0.8rem'}}>{row[0]?.row}</Typography> {/* Display row letter */} 
                {row.map((seat) => {
                  const isSelected = formik.values.seatIds.includes(seat.id);
                  let seatColor: "primary" | "secondary" | "error" | "inherit" | "success" | "warning" | "info" = "primary";
                  let seatVariant: "text" | "outlined" | "contained" = "outlined";

                  if (seat.status === SeatStatus.Booked) {
                    seatColor = "error";
                    seatVariant = "contained";
                  } else if (seat.status === SeatStatus.Unavailable) {
                    seatColor = "inherit"; // or some other color to show it's an unusable space
                    seatVariant = "text"; 
                  } else if (isSelected) {
                    seatColor = "success";
                    seatVariant = "contained";
                  }

                  return (
                    <Button 
                      key={seat.id} 
                      variant={seatVariant}
                      color={seatColor}
                      disabled={seat.status === SeatStatus.Booked || seat.status === SeatStatus.Unavailable}
                      onClick={() => {
                        if (seat.status === SeatStatus.Available || isSelected) {
                          const currentSeatIds = formik.values.seatIds;
                          if (isSelected) {
                            formik.setFieldValue('seatIds', currentSeatIds.filter(id => id !== seat.id));
                          } else {
                            formik.setFieldValue('seatIds', [...currentSeatIds, seat.id]);
                          }
                        }
                      }}
                      sx={{ 
                          minWidth: { xs: '28px', sm: '35px' }, width: { xs: '28px', sm: '35px' }, 
                          height: { xs: '28px', sm: '35px' }, 
                          p: 0, 
                          m: {xs: '1px', sm: '2px'},
                          fontSize: { xs: '0.6rem', sm: '0.7rem' },
                          border: seat.status === SeatStatus.Unavailable ? 'none' : undefined,
                          backgroundColor: seat.status === SeatStatus.Unavailable ? 'transparent' : undefined,
                          color: seat.status === SeatStatus.Unavailable ? 'transparent' : undefined,
                          cursor: seat.status === SeatStatus.Unavailable ? 'default' : 'pointer',
                          '&:hover': {
                            backgroundColor: seat.status === SeatStatus.Unavailable ? 'transparent !important' : undefined,
                            border: seat.status === SeatStatus.Unavailable ? 'none' : undefined,
                          }
                      }}
                    >
                      {seat.status !== SeatStatus.Unavailable ? seat.number : ''} 
                    </Button>
                  );
                })}
              </Box>
            ))}
            {formik.touched.seatIds && formik.errors.seatIds && (
              <Typography color="error" variant="caption" sx={{mt: 1, display: 'block', textAlign: 'center'}}>
                {formik.errors.seatIds}
              </Typography>
            )}
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>{t('booking.addFoodAndDrinks', 'Add Food & Drinks')}</Typography>
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
            {!loading && availableFoodItems.length === 0 && (
              <Typography sx={{my: 2}}>{t('booking.noFoodItems', 'No food or drink items available at the moment.')}</Typography>
            )}
            {!loading && availableFoodItems.length > 0 && (
              <Grid container spacing={2}>
                {availableFoodItems.map((item) => {
                  const currentSelection = formik.values.foodItems.find(fi => fi.itemId === item.id);
                  const quantity = currentSelection ? currentSelection.quantity : 0;

                  const handleQuantityChange = (newQuantity: number) => {
                    const updatedFoodItems = formik.values.foodItems.filter(fi => fi.itemId !== item.id);
                    if (newQuantity > 0) {
                      updatedFoodItems.push({ itemId: item.id, quantity: newQuantity });
                    }
                    formik.setFieldValue('foodItems', updatedFoodItems);
                  };

                  return (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                      <Paper elevation={1} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {item.imageUrl && (
                          <Box sx={{ height: 100, mb: 1, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <img src={item.imageUrl} alt={item.name} style={{ maxHeight: '100%', maxWidth: '100%', borderRadius: '4px' }} />
                          </Box>
                        )}
                        <Typography variant="subtitle1" fontWeight="bold">{item.name}</Typography>
                        <Typography variant="body2" color="text.secondary">${item.price.toFixed(2)}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{mb:1}}>{item.category}</Typography>
                        <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Button size="small" variant="outlined" onClick={() => handleQuantityChange(Math.max(0, quantity - 1))} disabled={quantity === 0}>
                            -
                          </Button>
                          <Typography sx={{ mx: 2, minWidth: '20px', textAlign: 'center' }}>{quantity}</Typography>
                          <Button size="small" variant="outlined" onClick={() => handleQuantityChange(quantity + 1)}>
                            +
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>{t('booking.confirmAndPay', 'Confirm & Pay')}</Typography>
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}

            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>{t('booking.summary.title', 'Booking Summary')}</Typography>
            
            {/* Showtime Details */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">{t('booking.summary.showtime', 'Showtime')}</Typography>
              <Divider sx={{my:1}} />
              {getSelectedShowtimeDetails() ? (
                <>
                  <ListItemText 
                    primary={t('booking.summary.movie', 'Movie: TODO')} // TODO: Get Movie Name if available
                    secondary={`${t('booking.summary.time', 'Time')}: ${getSelectedShowtimeDetails()?.time} | ${t('booking.summary.room', 'Room')}: ${getSelectedShowtimeDetails()?.roomName}`}
                  />
                </>
              ) : <Typography>{t('booking.summary.noShowtimeSelected', 'No showtime selected.')}</Typography>}
            </Box>

            {/* Seat Details */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">{t('booking.summary.seats', 'Seats')}</Typography>
              <Divider sx={{my:1}} />
              {formik.values.seatIds.length > 0 ? (
                <ListItemText 
                  primary={`${t('booking.summary.selectedSeats', 'Selected Seats')}: ${formik.values.seatIds.length}`}
                  secondary={`${t('booking.summary.seatNumbers', 'Seat(s)')}: ${formik.values.seatIds.join(', ')}`}
                />
              ) : <Typography>{t('booking.summary.noSeatsSelected', 'No seats selected.')}</Typography>}
            </Box>

            {/* Food & Drinks Details */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">{t('booking.summary.foodAndDrinks', 'Food & Drinks')}</Typography>
              <Divider sx={{my:1}} />
              {getSelectedFoodItemsDetails().length > 0 ? (
                <List dense>
                  {getSelectedFoodItemsDetails().map(item => (
                    item.id && (
                      <ListItem key={item.id} sx={{pl:0}}>
                        <ListItemText 
                          primary={`${item.name} (x${item.quantity})`}
                          secondary={`$${(item.subtotal || 0).toFixed(2)}`}
                        />
                      </ListItem>
                    )
                  ))}
                </List>
              ) : <Typography>{t('booking.summary.noFoodItemsSelected', 'No food or drinks added.')}</Typography>}
            </Box>
            
            {/* Total Price */}
            <Divider sx={{my:2}} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">{t('booking.summary.total', 'Total')}:</Typography>
              <Typography variant="h5" fontWeight="bold">${calculateTotalPrice().toFixed(2)}</Typography>
            </Box>

            {/* Payment Method Placeholder - The actual submission is handled by the main button */}
            <FormControl component="fieldset" fullWidth>
              <InputLabel id="payment-method-label" shrink sx={{position: 'static', transform: 'none', mb:1, fontWeight:'bold'}}>
                {t('booking.summary.paymentMethod', 'Payment Method')}
              </InputLabel>
              <RadioGroup
                aria-label="paymentMethod"
                name="paymentMethod"
                value={formik.values.paymentMethod}
                onChange={(event) => formik.setFieldValue('paymentMethod', event.target.value)}
                row
              >
                <FormControlLabel value="creditCard" control={<Radio />} label={t('booking.summary.creditCard', 'Credit Card (Mock)')} />
                <FormControlLabel value="paypal" control={<Radio />} label={t('booking.summary.paypal', 'PayPal (Mock)')} />
              </RadioGroup>
            </FormControl>

          </Box>
        );
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 3, boxShadow: '0 8px 30px 0 rgba(0,0,0,0.08)' }}>
      <Typography variant="h4" fontWeight="700" color="text.primary" sx={{ mb: 4, textAlign: 'center' }}>
        {t('booking.title', 'Book Your Tickets')}
      </Typography>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <form onSubmit={formik.handleSubmit}>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            {t('common.back', 'Back')}
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              {t('booking.confirmAndPay', 'Confirm & Pay')}
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={handleNext}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              {t('common.next', 'Next')}
            </Button>
          )}
        </Box>
      </form>
    </Paper>
  );
};

export default BookingForm; 