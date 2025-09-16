import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        "DATABASE_URL",
        "postgresql://user:password@db:5432/mydb"

    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    bcrypt.init_app(app)

    class User(db.Model):
        __tablename__ = "users"
        id = db.Column(db.Integer, primary_key=True)
        username = db.Column(db.String(80), unique=True, nullable=False)
        email = db.Column(db.String(120), unique=True, nullable=False)
        password_hash = db.Column(db.String(128), nullable=False)
        
    class Note(db.Model):
        __tablename__ = "notes"
        id = db.Column(db.Integer, primary_key=True)
        title = db.Column(db.String(200), nullable=False)
        content = db.Column(db.Text, nullable=True)
        def to_dict(self):
            return {"id": self.id, "title": self.title, "content": self.content}
    
    with app.app_context():
        db.create_all() # Create tables if they don't exist

    @app.route("/api/register", methods=["POST"])
    def register_user():
        data = request.get_json() or {}
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if not username or not password or not email:
            return jsonify({"error": "Username, email, and password are required"}), 400
        
        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Username already exists"}), 409

        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already registered"}), 409

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(username=username, email=email, password_hash=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": f"User {username} created successfully"}), 201

    @app.route("/api/notes", methods=["GET"])
    def list_notes():
        notes = Note.query.order_by(Note.id.desc()).all()
        return jsonify([n.to_dict() for n in notes]), 200

    @app.route("/api/notes", methods=["POST"])
    def create_note():
        data = request.get_json() or {}
        title = data.get("title")
        content = data.get("content")
        if not title:
            return jsonify({"error": "title required"}), 400
        n = Note(title=title, content=content)
        db.session.add(n)
        db.session.commit()
        return jsonify(n.to_dict()), 201

    @app.route("/api/notes/<int:nid>", methods=["PUT"])
    def update_note(nid):
        n = Note.query.get_or_404(nid)
        data = request.get_json() or {}
        n.title = data.get("title", n.title)
        n.content = data.get("content", n.content)
        db.session.commit()
        return jsonify(n.to_dict()), 200

    @app.route("/api/notes/<int:nid>", methods=["DELETE"])
    def delete_note(nid):
        n = Note.query.get_or_404(nid)
        db.session.delete(n)
        db.session.commit()
        return "", 204

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=True)
