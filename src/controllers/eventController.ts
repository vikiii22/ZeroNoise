import { Request, Response } from 'express';
import Event from '../models/Event';

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
      res.status(400).json({ error: 'lat, lng deben ser números y maxDistance un entero' });
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
