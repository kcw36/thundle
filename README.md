# thundle

This repository contains an ETL pipeline and frontend code for a wordle like quiz where the focus is guessing war thunder vehicles. There are several directories in this repository that each serve a unique function. Also to utilise the resources in this repository the user will need to install several dependancies first.

## Installation

- This project requires python and terraform.
- For my instructions I will use a native package manager.
- I will provide instructions for the main OS' of Windows, Mac and Linux.

### Package Manager

- Windows
    - Chocolatey
        ```sh
        Set-ExecutionPolicy Bypass -Scope Process -Force;
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072;
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        ```    
- Mac
    - Homebrew
    - `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
- Linux (Ubuntu)
    - APT is built in

### Python

- Windows
    - `choco install python --pre -y`
- Mac
    - `brew install python`
- Linux (Ubuntu)
    - `sudo apt install python3 python3-pip`

### Terraform

- Windows
    - `choco install terraform -y`
- Mac
    ```sh
    brew tap hashicorp/tap
    brew install hashicorp/tap/terraform
    ````
- Linux
    ```sh
    curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
    echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
    sudo apt install terraform
    ```

## Directories

Each Directory in this project serves a unique purpose that a repository user can utilise.

### Architecture

This directory provides terraform config for deploying the project infrastructure to the AWS cloud. This provides all infrastructure as code and can be utilised by a user who wants cloud deployed resources.

### Pipeline

This directory provides and ETL pipeline from a community driven API to parquet files. This resource can be driven locally or utilise cloud resources depending on user commands. INstructions on how to use this directory in full are found in that sub level README.

### Quiz

This directory provides a quiz frontend and backend. The quiz can pull from local parquet files or cloud deployed files depending on user commands when it is setup. 
