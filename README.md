Step 1: Create Azure Web App
Go to Azure Portal
Click <>"Create a resource"<> → <>"Web App"<>
Fill in the basic details:
Subscription: Your Azure subscription
Resource Group: Create new or select existing
Name: your-app-name (this will be your URL: your-app-name.azurewebsites.net)
Publish: Code
Runtime stack: Python 3.14
Operating System: Linux
Region: Choose closest to you
Click "Review + create" then "Create"
Step 2: Get Publish Profile
Go to your new Web App in Azure Portal
Click <>"Get publish profile"<> in the overview page
Save the downloaded .PublishSettings file
Open the file in a text editor - you'll need the content
Step 3: Configure GitHub Secrets Go to your GitHub repository → <>Settings<> → <>Secrets and variables<> → <>Actions<>
Create these <>TWO secrets<>:

<>AZURE_WEBAPP_NAME<>

Value: The name you gave your Azure Web App (e.g., my-ctai-app)
<>AZUREAPPSERVICE_PUBLISHPROFILE<>

Value: Paste the <>entire content<> of the .PublishSettings file you downloaded
Step 4: Deploy
The workflow will automatically run on your next push to main
Or manually trigger it in GitHub → <>Actions<> → <>"Deploy to Azure"<> → <>"Run workflow"<>
Für dieses Projekt muss im Azure Portal → App Service → Configuration ein Startup Command gesetzt werden, z. B.: gunicorn web_app:app --bind=0.0.0.0:80 (ggf. ein anderer Port)

Zusätzlich muss in Azure ein Identity-Provider hinzugefügt werden, dazu an Raik wenden
