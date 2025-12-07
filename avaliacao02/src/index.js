import express from 'express';
import swagger from "./docs/swagger.js";
import cors from 'cors';
import bookRoutes from './routes/BookRoutes.js';
import genreRoutes from './routes/GenreRoutes.js';
import reservationsRoutes from './routes/ReservationRoutes.js';
import reviewsRoutes from './routes/ReviewRoutes.js';
 

const app = express();
const PORT = 3001;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Servidor rodando!');
});

// Routes
app.use('/books', bookRoutes);
app.use('/genres', genreRoutes);
app.use('/reservations', reservationsRoutes);
app.use('/reviews', reviewsRoutes);

swagger(app);

app.listen(PORT, () => {
  console.log(`Servidor backend rodando em http://localhost:${PORT}`);
});