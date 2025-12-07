import { Router } from 'express'
import {
    getReservations,
    getReservationById,
    createReservation,
    updateReservation,
    returnReservation,
} from '../controllers/ReservationsController.js'

const router = Router()

router.post('/', createReservation)
router.get('/', getReservations)
router.get('/:id', getReservationById)
router.put('/:id', updateReservation)
router.put('/:id/return', returnReservation)

export default router
