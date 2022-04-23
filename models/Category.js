const slugify = require('slugify')
const Joi = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema

const categorySchema = new Schema({
  name: {
    type: String, 
    enum: ['Microsoft Office Suite', 'Graphic Design', 'Web Development & Hosting', 'Penetration Testing']
  }, 
  slug: {
    type: String, 
    required: true, 
    unique: true
  },
  image: {
    type: String
  },
}, { timestamps: true })

// Slugify our category-name to get a slug value 
categorySchema.pre('validate', function(){
  if(this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true })
  }
})

const Category = mongoose.model('Category', categorySchema);

const validateCategory = (category) => {
  const schema = Joi.object({
      name: Joi.string().min(5).max(255).required(),
  })

  return schema.validate(category);
}

exports.validate = validateCategory;
exports.Category = Category;