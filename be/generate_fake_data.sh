#!/bin/bash
echo "Running fake data generator..."
cd "$(dirname "$0")"
python -m app.utils.generate_fake_data
echo "Done!"
read -p "Press Enter to continue..."
