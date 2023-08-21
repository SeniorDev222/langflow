provider "aws" {
  region = "us-east-1" # Choose the region as needed
}

module "docker-swarm" {
  source          = "./modules/docker-swarm"
  key_name        = aws_key_pair.swarm-key.key_name
  vpc_id          = aws_vpc.swarm-vpc.id
  subnet_id       = aws_subnet.swarm-subnet.id
  security_group  = aws_security_group.swarm-sg.id
  instance_type   = "t2.micro" # Choose the instance type as needed
  manager_count   = 1
  worker_count    = 10 # This is the number of services in the docker-compose.yml file
}

resource "aws_key_pair" "swarm-key" {
  key_name   = "swarm-key"
  public_key = file("~/.ssh/id_rsa.pub")
}

resource "aws_vpc" "swarm-vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_support = true
  enable_dns_hostnames = true
}

resource "aws_subnet" "swarm-subnet" {
  vpc_id     = aws_vpc.swarm-vpc.id
  cidr_block = "10.0.1.0/24"
}

resource "aws_security_group" "swarm-sg" {
  vpc_id = aws_vpc.swarm-vpc.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 2376
    to_port     = 2377
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 7946
    to_port     = 7946
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 4789
    to_port     = 4789
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
