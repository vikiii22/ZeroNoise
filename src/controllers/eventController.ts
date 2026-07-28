import { Request, Response } from 'express';
import Event from '../models/Event';

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category, physicalReference, mapUrl, startTime, location } = req.body;

    if (!title || !category || !physicalReference || !startTime || !location) {
      res.status(400).json({ error: 'Todos los campos son requeridos' });
      return;
    }

    const event = await Event.create({
      title,
      category,
      physicalReference,
      mapUrl,
      startTime: new Date(startTime),
      creatorId: req.userId,
      location
    });

    const populated = await event.populate(['creatorId', 'attendees']);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear evento' });
  }
};

export const getNearbyEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, maxDistance, category } = req.query;

    if (!lat || !lng || !maxDistance) {
      res.status(400).json({ error: 'lat, lng y maxDistance son requeridos' });
      return;
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const maxDist = parseInt(maxDistance as string, 10);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(maxDist)) {
      res.status(400).json({ error: 'lat, lng deben ser n�meros y maxDistance un entero' });
      return;
    }

    const filter: any = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDist
        }
      },
      startTime: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 3 * 60 * 60 * 1000)
      }
    };

    if (category) {
      filter.category = category;
    }

    const events = await Event.find(filter).populate('creatorId', 'name').populate('attendees', 'name');

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar eventos cercanos' });
  }
};

export const getAllEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await Event.find({ startTime: { $gte: new Date() } })
      .populate('creatorId', 'name')
      .populate('attendees', 'name');

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar todos los eventos' });
  }
};
