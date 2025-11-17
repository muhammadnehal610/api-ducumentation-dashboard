import { Request, Response, NextFunction } from 'express';
import OverviewCard from '../models/OverviewCard';

// @desc    Get all overview cards for a service
// @route   GET /api/overview-cards?serviceId=:serviceId
// @access  Public
// FIX: Replaced RequestHandler with explicit types to resolve overload errors.
export const getOverviewCards = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { serviceId } = req.query;
        if (!serviceId) {
            return res.status(400).json({ success: false, message: "Service ID is required." });
        }
        const cards = await OverviewCard.find({ serviceId });
        res.status(200).json({ success: true, count: cards.length, data: cards });
    } catch (error) {
        next(error);
    }
};

// @desc    Create an overview card
// @route   POST /api/overview-cards
// @access  Private/Admin
// FIX: Replaced RequestHandler with explicit types to resolve overload errors.
export const createOverviewCard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body.serviceId) {
            return res.status(400).json({ success: false, message: "Service ID is required to create a card." });
        }
        const card = await OverviewCard.create(req.body);
        res.status(201).json({ success: true, data: card });
    } catch (error) {
        next(error);
    }
};

// @desc    Update an overview card
// @route   PUT /api/overview-cards/:id
// @access  Private/Admin
// FIX: Replaced RequestHandler with explicit types to resolve overload errors.
export const updateOverviewCard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const card = await OverviewCard.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!card) {
            return res.status(404).json({ success: false, message: 'Card not found.' });
        }
        res.status(200).json({ success: true, data: card });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete an overview card
// @route   DELETE /api/overview-cards/:id
// @access  Private/Admin
// FIX: Replaced RequestHandler with explicit types to resolve overload errors.
export const deleteOverviewCard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const card = await OverviewCard.findByIdAndDelete(req.params.id);
        if (!card) {
            return res.status(404).json({ success: false, message: 'Card not found.' });
        }
        res.status(200).json({ success: true, message: 'Card deleted successfully.' });
    } catch (error) {
        next(error);
    }
};
