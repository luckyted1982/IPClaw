export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  return password.length >= 6;
}

export function validateCreateTask(req, res, next) {
  const { title, description, category, budget } = req.body;
  
  if (!title || title.trim().length === 0) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  if (!description || description.trim().length === 0) {
    return res.status(400).json({ error: 'Description is required' });
  }
  
  if (!category || category.trim().length === 0) {
    return res.status(400).json({ error: 'Category is required' });
  }
  
  if (!budget || isNaN(parseFloat(budget)) || parseFloat(budget) <= 0) {
    return res.status(400).json({ error: 'Valid budget is required' });
  }
  
  next();
}

export function validateRegister(req, res, next) {
  const { email, password, name } = req.body;
  
  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  
  if (!password || !validatePassword(password)) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  next();
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body;
  
  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  
  next();
}

export function sanitizeInput(input) {
  if (typeof input === 'string') {
    return input
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }
  return input;
}

export function sanitizeRequestBody(req, res, next) {
  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === 'string') {
      req.body[key] = sanitizeInput(req.body[key]);
    }
  });
  next();
}