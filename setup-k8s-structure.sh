#!/bin/bash
# setup-k8s-structure.sh - Setup complete Kubernetes structure

set -e

echo "=========================================="
echo "🚀 Setting Up K8s Structure"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create directory structure
echo -e "${YELLOW}Creating directory structure...${NC}"
mkdir -p k8s/{base,overlays/{dev,staging,prod},database/changelog}

echo -e "${GREEN}✅ Directories created${NC}"

# Copy Liquibase changelogs
echo -e "${YELLOW}Setting up Liquibase changelogs...${NC}"
cat > k8s/database/changelog/db.changelog-master.yaml << 'EOF'
databaseChangeLog:
  - include:
      file: 001-create-tables.yaml
      relativeToChangelogFile: true
  - include:
      file: 002-seed-data.yaml
      relativeToChangelogFile: true
EOF

# Copy your existing changelog (you have this already)
if [ -f "backend/database/changelog/001-create-tables.yaml" ]; then
    cp backend/database/changelog/001-create-tables.yaml k8s/database/changelog/
    echo -e "${GREEN}✅ Copied 001-create-tables.yaml${NC}"
else
    echo -e "${YELLOW}⚠️  Please copy your 001-create-tables.yaml manually${NC}"
fi

# Create seed data template
cat > k8s/database/changelog/002-seed-data.yaml << 'EOF'
databaseChangeLog:
  - changeSet:
      id: seed-initial-salles
      author: farouk
      changes:
        - insert:
            tableName: salles
            columns:
              - column: {name: code, value: "A101"}
              - column: {name: type, value: "Conference"}
              - column: {name: capacite, value: 50}
              - column: {name: statut, value: "available"}
        - insert:
            tableName: salles
            columns:
              - column: {name: code, value: "B202"}
              - column: {name: type, value: "Meeting"}
              - column: {name: capacite, value: 20}
              - column: {name: statut, value: "available"}
EOF

echo -e "${GREEN}✅ Liquibase changelogs ready${NC}"

# Validate structure
echo -e "${YELLOW}Validating structure...${NC}"
tree k8s/ || find k8s/ -type f

echo ""
echo "=========================================="
echo -