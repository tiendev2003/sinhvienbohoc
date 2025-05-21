@echo off
echo Running fake data generator...
cd /d %~dp0
python -m app.utils.generate_fake_data
echo Done!
pause
