#!/bin/bash

set -e

GIT_REPO="https://github.com/tonyliuzj/librix.git"
INSTALL_DIR="$HOME/librix"

show_menu() {
  echo "========== Librix Installer =========="
  echo "1) Install"
  echo "2) Update"
  echo "3) Uninstall"
  echo "======================================="
  read -p "Select an option [1-3]: " CHOICE
  case $CHOICE in
    1) install_librix ;;
    2) update_librix ;;
    3) uninstall_librix ;;
    *) echo "Invalid choice. Exiting." ; exit 1 ;;
  esac
}

install_librix() {
  echo "Starting Librix Installation..."

  echo "Installing system dependencies..."
  sudo apt update
  sudo apt install -y git curl sqlite3 build-essential

  echo "Checking Node.js version..."
  if command -v node >/dev/null 2>&1; then
    VERSION=$(node -v | sed 's/^v//')
    MAJOR=${VERSION%%.*}
    if [ "$MAJOR" -lt 18 ]; then
      echo "Node.js v$VERSION detected (<18)."
      read -p "Do you want to install Node.js 22? (y/n): " INSTALL_22
      if [[ "$INSTALL_22" =~ ^[Yy]$ ]]; then
        echo "Installing Node.js 22..."
        curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
        sudo apt install -y nodejs
      else
        echo "Installation requires Node.js >=18. Exiting."
        exit 1
      fi
    else
      echo "Node.js v$VERSION detected. Skipping installation."
    fi
  else
    echo "Node.js not found. Installing Node.js 22..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt install -y nodejs
  fi

  echo "Checking for PM2..."
  if command -v pm2 >/dev/null 2>&1; then
    echo "PM2 is already installed. Skipping installation."
  else
    echo "Installing PM2..."
    npm install -g pm2
  fi

  if [ -d "$INSTALL_DIR" ]; then
    if [ -d "$INSTALL_DIR/.git" ]; then
      echo "Repository already exists. Pulling latest changes..."
      cd "$INSTALL_DIR"
      git pull
    else
      echo "Directory exists but is not a git repository. Removing and cloning fresh..."
      rm -rf "$INSTALL_DIR"
      git clone "$GIT_REPO" "$INSTALL_DIR"
      cd "$INSTALL_DIR"
    fi
  else
    git clone "$GIT_REPO" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
  fi

  echo "Installing TypeScript..."
  npm install -g typescript

  echo "Configuring environment variables..."
  read -s -p "NextAuth secret (min 32 characters, or press Enter to generate): " NEXTAUTH_SECRET
  echo ""

  if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "Generating random secret..."
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
  fi

  while [ ${#NEXTAUTH_SECRET} -lt 32 ]; do
    echo "NextAuth secret must be at least 32 characters"
    read -s -p "Please enter a NextAuth secret (min 32 characters): " NEXTAUTH_SECRET
    echo ""
  done

  read -p "Port number (press Enter for default 3000): " APP_PORT
  APP_PORT=${APP_PORT:-3000}

  cat > .env.local <<EOF
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
PORT=$APP_PORT
EOF

  echo ".env.local created"

  echo "Installing project dependencies..."
  npm install

  echo "Building the app..."
  npm run build

  echo "Starting Librix under PM2 on port $APP_PORT..."
  pm2 start "npm run start -- -p $APP_PORT" --name "librix"
  pm2 save
  pm2 startup

  echo ""
  echo "Installation complete!"
  echo "Visit: http://localhost:$APP_PORT"
  echo "To view PM2 processes: pm2 list"
  echo "To see logs: pm2 logs librix"
}

update_librix() {
  echo "Updating Librix..."

  if [ ! -d "$INSTALL_DIR/.git" ]; then
    echo "Librix not installed or not a git repository in $INSTALL_DIR."
    exit 1
  fi

  cd "$INSTALL_DIR"
  git pull

  echo "Updating dependencies..."
  npm install

  echo "Rebuilding the app..."
  npm run build

  echo "Restarting Librix with PM2..."
  APP_PORT=$(grep PORT .env.local | cut -d'=' -f2)
  pm2 delete librix || true
  pm2 start "npm run start -- -p $APP_PORT" --name "librix"
  pm2 save

  echo "Update complete!"
  echo "Visit: http://localhost:$APP_PORT"
}

uninstall_librix() {
  echo "Uninstalling Librix..."

  if pm2 list | grep -q librix; then
    pm2 stop librix
    pm2 delete librix
  fi

  if [ -d "$INSTALL_DIR" ]; then
    rm -rf "$INSTALL_DIR"
    echo "Removed $INSTALL_DIR"
  else
    echo "Librix directory not found."
  fi

  echo "Note: Node.js, PM2, and other system dependencies are NOT removed."
  echo "Remove them manually if desired: sudo apt remove nodejs pm2 ..."
  echo "Uninstall complete!"
}

show_menu