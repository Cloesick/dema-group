import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

interface Employee {
  id: string;
  employeeId: string;
  email: string;
  name: string;
  department?: string;
  verified: boolean;
  active: boolean;
  role: 'employee' | 'admin';
  createdAt: string;
}

async function getEmployees(): Promise<Employee[]> {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'employees.json');
    const fileContents = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading employees:', error);
    return [];
  }
}

async function saveEmployees(employees: Employee[]): Promise<void> {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'employees.json');
    await fs.writeFile(dataPath, JSON.stringify(employees, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving employees:', error);
    throw new Error('Failed to save employee data');
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is logged in
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in first' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { employeeId } = body;

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Check if email is from @demashop.be domain
    const userEmail = session.user.email;
    const isDemaEmail = userEmail.endsWith('@demashop.be');
    
    // Load employees
    const employees = await getEmployees();
    
    // Find employee by ID
    const employee = employees.find(
      (emp) => emp.employeeId === employeeId && emp.active
    );

    if (!employee) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid Employee ID or employee not active',
          message: 'Please contact your manager to activate your employee account'
        },
        { status: 404 }
      );
    }

    // Check if email matches (if employee has an email registered)
    if (employee.email && employee.email !== userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email mismatch',
          message: `This employee ID is registered to ${employee.email}. Please log in with the correct email.`
        },
        { status: 403 }
      );
    }

    // If no email registered yet, update it
    if (!employee.email) {
      employee.email = userEmail;
      employee.verified = true;
      await saveEmployees(employees);
    }

    // Verify employee
    if (!employee.verified) {
      employee.verified = true;
      await saveEmployees(employees);
    }

    return NextResponse.json({
      success: true,
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        role: employee.role,
        verified: employee.verified
      },
      message: 'Employee verified successfully!',
      canUploadPdfs: true
    });

  } catch (error) {
    console.error('Error verifying employee:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check current verification status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { verified: false, employee: null },
        { status: 200 }
      );
    }

    const employees = await getEmployees();
    const employee = employees.find(
      (emp) => emp.email === session.user!.email && emp.active && emp.verified
    );

    if (employee) {
      return NextResponse.json({
        verified: true,
        employee: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          department: employee.department,
          role: employee.role,
          employeeId: employee.employeeId
        },
        canUploadPdfs: true
      });
    }

    return NextResponse.json({
      verified: false,
      employee: null,
      canUploadPdfs: false
    });

  } catch (error) {
    console.error('Error checking verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
