import { Request, Response } from 'express';
import Event from '../models/Event';
import Category from '../models/Category';

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category, physicalReference, mapUrl, capacity, startTime, location } = req.body;

    if (!title || !category || !startTime || !location) {
      res.status(400).json({ error: 'Todos los campos son requeridos' });
      return;
    }

    const cat = await Category.findOne({ name: category });
    if (!cat) {
      res.status(400).json({ error: 'CategorÃ­a no encontrada' });
      return;
    }

    const event = await Event.create({
      title,
      category: cat._id,
      physicalReference,
      mapUrl,
      capacity,
      startTime: new Date(startTime),
      creatorId: req.userId,
      location
    });

    const populated = await event.populate(['creatorId', 'attendees', 'category']);
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
      res.status(400).json({ error: 'lat, lng deben ser nï¿½meros y maxDistance un entero' });
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

    const events = await Event.find(filter).populate('creatorId', 'name').populate('attendees', 'name').populate('category');

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar eventos cercanos' });
  }
};

export const getAllEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await Event.find({ startTime: { $gte: new Date() } })
      .populate('creatorId', 'name')
      .populate('attendees', 'name')
      .populate('category');

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar todos los eventos' });
  }
};

export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, category, physicalReference, mapUrl, capacity, startTime, location } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      res.status(404).json({ error: 'Evento no encontrado' });
      return;
    }
    if (event.creatorId.toString() !== req.userId) {
      res.status(403).json({ error: 'No tienes permiso para editar este evento' });
      return;
    }

    let catId = event.category;
    if (category) {
      const cat = await Category.findOne({ name: category });
      if (!cat) {
        res.status(400).json({ error: 'Categoría no encontrada' });
        return;
      }
      catId = cat._id;
    }

    event.title = title ?? event.title;
    event.category = catId;
    event.physicalReference = physicalReference ?? event.physicalReference;
    event.mapUrl = mapUrl ?? event.mapUrl;
    event.capacity = capacity ?? event.capacity;
    event.startTime = startTime ? new Date(startTime) : event.startTime;
    event.location = location ?? event.location;

    await event.save();
    const populated = await event.populate(['creatorId', 'attendees', 'category']);
    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar evento' });
  }
};

export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      res.status(404).json({ error: 'Evento no encontrado' });
      return;
    }
    if (event.creatorId.toString() !== req.userId) {
      res.status(403).json({ error: 'No tienes permiso para eliminar este evento' });
      return;
    }

    await event.deleteOne();
    res.json({ message: 'Evento eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
};

export const joinEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      res.status(404).json({ error: 'Evento no encontrado' });
      return;
    }

    const userId = req.userId!;

    if (event.attendees.some(a => a.toString() === userId)) {
      res.status(400).json({ error: 'Ya estás apuntado a este evento' });
      return;
    }

    if (event.capacity && event.registeredCount >= event.capacity) {
      res.status(400).json({ error: 'El evento está completo' });
      return;
    }

    event.attendees.push(userId as any);
    event.registeredCount += 1;
    await event.save();

    const populated = await event.populate(['creatorId', 'attendees', 'category']);
    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: 'Error al apuntarse al evento' });
  }
};

export const leaveEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      res.status(404).json({ error: 'Evento no encontrado' });
      return;
    }

    const userId = req.userId!;

    const index = event.attendees.findIndex(a => a.toString() === userId);
    if (index === -1) {
      res.status(400).json({ error: 'No estás apuntado a este evento' });
      return;
    }

    event.attendees.splice(index, 1);
    event.registeredCount = Math.max(0, event.registeredCount - 1);
    await event.save();

    const populated = await event.populate(['creatorId', 'attendees', 'category']);
    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: 'Error al cancelar inscripción' });
  }
};

export const getMyEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const created = await Event.find({ creatorId: userId })
      .populate('creatorId', 'name')
      .populate('attendees', 'name')
      .populate('category')
      .sort({ startTime: 1 });

    const joined = await Event.find({ attendees: userId, creatorId: { $ne: userId } })
      .populate('creatorId', 'name')
      .populate('attendees', 'name')
      .populate('category')
      .sort({ startTime: 1 });

    res.json({ created, joined });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tus eventos' });
  }
};
