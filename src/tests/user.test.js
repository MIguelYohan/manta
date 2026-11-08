import prisma from '../config/prisma.js'
import crypto from 'crypto';

function generateRandomHash(size = 32) {
  const array = new Uint8Array(size / 2);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function createTestUser(){
    const userHash = generateRandomHash();
    const user = await prisma.user.create({
        data: {
            googleId: userHash,
            email: `${userHash}@email.test`,
            name: `TEST-USER[${userHash}]`,
            picture: 'test',
        },
    });
    await prisma.$disconnect();
    return user;
}

async function deleteTestUser(id){
    try {
        const deleteUser = await prisma.user.delete({
            where: {
                id: id,
            },
        });
        return {status: 'success', user: deleteUser};
    }
    catch(e){
        return {status: 'error', message: e.message};
    }
    finally {
        await prisma.$disconnect();
    }
}

// Execução do Script de criação/deleção de usuários teste no DB
const args = process.argv;
const argMethod = args.find(arg => arg.startsWith('--method='))?.split('=')[1];
const id = args.find(arg => arg.startsWith('--id='))?.split('=')[1];

if(argMethod === 'create'){
    const user = await createTestUser();
    console.log(user);
}
else if(argMethod === 'delete' && id){
    const result = await deleteTestUser(id);
    console.log(result);
}
