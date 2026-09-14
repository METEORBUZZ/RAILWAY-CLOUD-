# IAM Role and Instance Profile for Kubeadm EC2 Nodes

resource "aws_iam_role" "k8s_node_role" {
  name = "railcloud-${var.environment}-k8s-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "cloudwatch_agent" {
  role       = aws_iam_role.k8s_node_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.k8s_node_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "k8s_node_profile" {
  name = "railcloud-${var.environment}-k8s-node-profile"
  role = aws_iam_role.k8s_node_role.name
}
