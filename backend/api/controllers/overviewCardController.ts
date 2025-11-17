import { RequestHandler } from 'express';
import OverviewCard from '../models/OverviewCard';

// @desc    Get all overview cards for a service
// @route   GET /api/overview-cards?serviceId=:serviceId
// @access  Public
export const getOverviewCards: RequestHandler = async (req, res, next) => {
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
export const createOverviewCard: RequestHandler = async (req, res, next) => {
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
export const updateOverviewCard: RequestHandler = async (req, res, next) => {
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
export const deleteOverviewCard: RequestHandler = async (req, res, next) => {
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